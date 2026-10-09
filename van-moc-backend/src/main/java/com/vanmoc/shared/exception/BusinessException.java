package com.vanmoc.shared.exception;

public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Object[] messageArgs;

    public BusinessException(ErrorCode errorCode, Object... messageArgs) {
        this.errorCode = errorCode;
        this.messageArgs = messageArgs;
    }

    public BusinessException(ErrorCode errorCode) {
        this(errorCode, (Object[]) null);
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Object[] getMessageArgs() {
        return messageArgs;
    }
}
