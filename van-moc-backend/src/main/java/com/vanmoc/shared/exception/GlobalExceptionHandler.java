package com.vanmoc.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {
    @ExceptionHandler(RuleException.class)
    public ResponseEntity<ProblemDetail> handleRule(RuleException exception) {
        var problem = ProblemDetail.forStatusAndDetail(exception.getStatus(),
                message("rule." + exception.getCode() + ".detail", "Request cannot be completed."));
        problem.setProperty("code", exception.getCode());
        return ResponseEntity.status(exception.getStatus()).body(problem);
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied() {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied.");
        problem.setProperty("code", "ACCESS_DENIED");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }
    private final MessageSource messageSource;
    private final String serviceName;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException exception,
                                                       HttpServletRequest request) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                message("resource-not-found.detail", "Requested resource was not found."));
        problem.setTitle(message("resource-not-found.title", "Resource Not Found"));
        problem.setType(problemType("resource-not-found"));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", exception.getCode());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HandlerMethodValidationException.class})
    public ResponseEntity<ProblemDetail> handleInvalidParameter(Exception exception, HttpServletRequest request) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                message("invalid-parameter.detail", "Request parameter is invalid."));
        problem.setTitle(message("invalid-parameter.title", "Invalid Parameter"));
        problem.setType(problemType("invalid-parameter"));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", "INVALID_PARAMETER");
        return ResponseEntity.badRequest().body(problem);
    }

    public GlobalExceptionHandler(
            MessageSource messageSource,
            @Value("${spring.application.name}") String serviceName) {
        this.messageSource = messageSource;
        this.serviceName = serviceName;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                message("validation-error.detail", "Input validation failed.")
        );
        problemDetail.setTitle(message("validation-error.title", "Validation Failed"));
        problemDetail.setType(problemType("validation-error"));
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        List<Map<String, String>> invalidParams = new ArrayList<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            Map<String, String> error = new LinkedHashMap<>();
            error.put("field", fieldError.getField());
            error.put("message", fieldError.getDefaultMessage());
            invalidParams.add(error);
        }
        problemDetail.setProperty("invalid_params", invalidParams);
        problemDetail.setProperty("code", "VALIDATION_ERROR");

        return ResponseEntity.badRequest().body(problemDetail);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                message("invalid-request-body.detail", "Request body is malformed or contains an invalid value.")
        );
        problemDetail.setTitle(message("invalid-request-body.title", "Invalid Request Body"));
        problemDetail.setType(problemType("invalid-request-body"));
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        problemDetail.setProperty("code", "INVALID_REQUEST_BODY");

        return ResponseEntity.badRequest().body(problemDetail);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusinessException(
            BusinessException exception,
            HttpServletRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        ErrorCode errorCode = exception.getErrorCode();
        String typeSuffix = errorCode.getTypeSuffix();
        String detailKey = typeSuffix + ".detail";
        String titleKey = typeSuffix + ".title";
        String detail = messageSource.getMessage(
                detailKey,
                exception.getMessageArgs(),
                detailKey,
                locale
        );
        String title = messageSource.getMessage(titleKey, null, titleKey, locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(errorCode.getStatus(), detail);
        problemDetail.setTitle(title);
        problemDetail.setType(problemType(typeSuffix));
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.status(errorCode.getStatus()).body(problemDetail);
    }

    private URI problemType(String suffix) {
        return URI.create("urn:vanmoc:" + serviceName + ":" + suffix);
    }

    private String message(String key, String defaultMessage) {
        return messageSource.getMessage(key, null, defaultMessage, LocaleContextHolder.getLocale());
    }
}
