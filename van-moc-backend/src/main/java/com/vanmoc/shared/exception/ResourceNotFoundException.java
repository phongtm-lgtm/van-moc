package com.vanmoc.shared.exception;

public class ResourceNotFoundException extends RuntimeException {
    private final String code;
    public ResourceNotFoundException(String code) {
        super(code);
        this.code = code;
    }
    public String getCode() { return code; }
}
