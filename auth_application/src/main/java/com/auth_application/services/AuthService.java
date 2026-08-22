package com.auth_application.services;

import com.auth_application.dtos.RefreshTokenRequest;
import com.auth_application.dtos.RefreshTokenResponse;
import com.auth_application.dtos.UserDto;

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