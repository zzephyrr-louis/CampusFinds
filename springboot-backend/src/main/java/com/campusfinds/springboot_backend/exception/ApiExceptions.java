package com.campusfinds.springboot_backend.exception;

public class ApiExceptions {

    public static class AccountConflictException extends RuntimeException {
        public AccountConflictException(String message) {
            super(message);
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }
}
