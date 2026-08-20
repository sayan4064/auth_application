package com.auth_application.services;

import com.auth_application.dtos.UserDto;

public interface AuthService {
    public UserDto registerUser(UserDto userDto);
}
