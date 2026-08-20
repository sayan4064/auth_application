package com.auth_application.exception;

public class ResoureceNotFoundException extends RuntimeException {

    public ResoureceNotFoundException() {
        super("Resource not found");
    }
    public ResoureceNotFoundException(String message) {
        super(message);
    }
}
