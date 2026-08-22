package com.auth_application.services.impl;

import com.auth_application.dtos.RefreshTokenRequest;
import com.auth_application.dtos.RefreshTokenResponse;
import com.auth_application.dtos.UserDto;
import com.auth_application.entity.RefreshToken;
import com.auth_application.entity.User;
import com.auth_application.repository.RefreshTokenRepository;
import com.auth_application.security.CookieService;
import com.auth_application.security.JwtService;
import com.auth_application.services.AuthService;
import com.auth_application.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
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
    private final RefreshTokenRepository refreshTokenRepository;
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
        RefreshToken refreshToken=RefreshToken
                .builder()
                .jti(jti)
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now()
                        .plusSeconds(jwtService.getRefreshTokenTtlSeconds()))
                .revoked(false)
                .build();
        //save refresh token
refreshTokenRepository.save(refreshToken);

//generate access token
        String accessToken = jwtService.generateAccessToken(user);

        //generate refresh token jwt
        String refreshTokenJwt =jwtService.generateRefreshToken(user,jti);

        //attach refresh token to cookie
        cookieService.attachRefreshCookie(response,refreshTokenJwt, jwtService.getRefreshTokenTtlSeconds());

        //no cache
        cookieService.addNoStoreHeaders(response);

        //return response
        return new RefreshTokenResponse(accessToken,refreshTokenJwt);

    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest body, HttpServletRequest request, HttpServletResponse response) {
        //read refresh token
        String refreshToken = readRefreshTokenFromRequest(body, request);

        //chech token type
        if(!jwtService.isRefreshToken(refreshToken)){
            throw new BadCredentialsException("Invalid refresh token type");
        }

        //get jti
        String jti = jwtService.getJti(refreshToken);

        //get user id
        UUID userId= jwtService.getUserId(refreshToken);

        //find stored token
        RefreshToken storedRefreshToken=refreshTokenRepository
                .findByJti(jti)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));

        //check revoked
        if(storedRefreshToken.isRevoked()){
            throw new BadCredentialsException("Refresh token is revoked");
        }

        //check expiration
        if(storedRefreshToken.getExpiresAt().isBefore(Instant.now())){
            throw new BadCredentialsException("Refresh token is expired");
        }

        //check userId
        if(!storedRefreshToken.getUser().getId().equals(userId)){
            throw new BadCredentialsException("Invalid user id");
        }

        //get user
        User user=storedRefreshToken.getUser();

        //revoke old refresh token
        storedRefreshToken.setRevoked(true);

        //generate new jti
        String newJti=UUID.randomUUID().toString();

        //set replacement JTI
        storedRefreshToken.setReplacedByToken(newJti);

        //save old token
        refreshTokenRepository.save(storedRefreshToken);

        //create new refreshtoken
        RefreshToken newRefreshToken = RefreshToken.builder().jti(newJti).user(user).createdAt(Instant.now()).expiresAt(Instant.now().plusSeconds(jwt)).build();
        return null;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {

    }


}
