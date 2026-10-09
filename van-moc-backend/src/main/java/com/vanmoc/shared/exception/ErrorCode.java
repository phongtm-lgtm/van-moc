package com.vanmoc.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Contract implemented by each service's business error enum.
 */
public interface ErrorCode {

    HttpStatus getStatus();

    String getTypeSuffix();
}
