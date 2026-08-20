package com.auth_application.services.impl;

import com.auth_application.dtos.UserDto;
import com.auth_application.services.AuthService;
import com.auth_application.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    @Override
    public UserDto registerUser(UserDto userDto) {
        String password = userDto.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        userDto.setPassword(encodedPassword);
        return userService.createUser(userDto);
    }

    @Override
    public Object loginUser(UserDto userDto) {
        return null;
    }

    @Override
    public Object refreshToken(String refreshToken) {
        return null;
    }

    @Override
    public void logout(String refreshToken) {

    }

}
