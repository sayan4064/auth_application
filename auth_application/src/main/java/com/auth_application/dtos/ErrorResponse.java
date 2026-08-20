package com.auth_application.dtos;

public record ErrorResponse(
        String message,
        String status,
        Integer statusCode
) {
}