package com.auth_application.services.impl;

import com.auth_application.dtos.RefreshTokenRequest;
import com.auth_application.dtos.RefreshTokenResponse;
import com.auth_application.dtos.UserDto;
import com.auth_application.entity.RefreshToken;
import com.auth_application.entity.User;
import com.auth_application.security.CookieService;
import com.auth_application.security.JwtService;
import com.auth_application.services.AuthService;
import com.auth_application.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CookieService cookieService;

    @Override
    public UserDto registerUser(UserDto userDto) {
        String password = userDto.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        userDto.setPassword(encodedPassword);
        return userService.createUser(userDto);
    }

    @Override
    public Object loginUser(UserDto userDto, HttpServletResponse response) {
       //authenticate user
        Authentication authentication= authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userDto.getEmail(),userDto.getPassword()));

        //get authenticate user
        User user = (User) authentication.getPrincipal();

        //generate jti
        String jti = UUID.randomUUID().toString();

        //create refresh token
        RefreshToken refreshToken=RefreshToken.builder().jti(jti)
                .user(user).createdAt(Instant.now());
        return null;
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest body, HttpServletRequest request, HttpServletResponse response) {
        return null;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {

    }


}
