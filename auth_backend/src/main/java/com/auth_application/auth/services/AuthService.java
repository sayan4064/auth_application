package com.auth_application.auth.services;

import com.auth_application.auth.payload.RefreshTokenRequest;
import com.auth_application.auth.payload.RefreshTokenResponse;
import com.auth_application.auth.payload.UserDto;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    UserDto registerUser(UserDto userDto);

    Object loginUser(
            UserDto userDto,
            HttpServletResponse response
    );

    RefreshTokenResponse refreshToken(
            RefreshTokenRequest body,
            HttpServletRequest request,
            HttpServletResponse response
    );

    void logout(
            HttpServletRequest request,
            HttpServletResponse response
    );
}