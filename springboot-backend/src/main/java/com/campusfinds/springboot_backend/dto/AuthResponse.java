package com.campusfinds.springboot_backend.dto;

public class AuthResponse {

    private String message;
    private String token;
    private UserDto user;

    public AuthResponse(String message, String token, UserDto user) {
        this.message = message;
        this.token = token;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public UserDto getUser() {
        return user;
    }
}
