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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
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
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token type");
        }

        //get jti
        String jti = jwtService.getJti(refreshToken);

        //get user id
        UUID userId = jwtService.getUserId(refreshToken);

        //find stored token
        RefreshToken storedRefreshToken = refreshTokenRepository
                .findByJti(jti)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));

        //check revoked
        if (storedRefreshToken.isRevoked()) {
            throw new BadCredentialsException("Refresh token is revoked");
        }

        //check expiration
        if (storedRefreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token is expired");
        }

        //check userId
        if (!storedRefreshToken.getUser().getId().equals(userId)) {
            throw new BadCredentialsException("Invalid user id");
        }

        //get user
        User user = storedRefreshToken.getUser();

        //revoke old refresh token
        storedRefreshToken.setRevoked(true);

        //generate new jti
        String newJti = UUID.randomUUID().toString();

        //set replacement JTI
        storedRefreshToken.setReplacedByToken(newJti);

        //save old token
        refreshTokenRepository.save(storedRefreshToken);

        //create new refreshtoken
        RefreshToken newRefreshToken = RefreshToken
                .builder()
                .jti(newJti)
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now()
                        .plusSeconds(jwtService.getRefreshTokenTtlSeconds()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newRefreshToken);
        //generate new access token
        String newAccessToken = jwtService.generateAccessToken(user);

        //generate newRefreshToken
        String newRefreshTokenJwt = jwtService.generateRefreshToken(user, newJti);

        //update cache
        cookieService.attachRefreshCookie(response, newRefreshTokenJwt, jwtService.getRefreshTokenTtlSeconds());

        //no cache
        cookieService.addNoStoreHeaders(response);

        //return responcse
        return new RefreshTokenResponse(newAccessToken, newRefreshTokenJwt);

    }
    //read refresh token
    private String readRefreshTokenFromRequest(RefreshTokenRequest body, HttpServletRequest request) {
        if (request.getCookies() != null) {
            var fromCookie = Arrays.stream(request.getCookies())
                            .filter(cookie ->
                                    cookie.getName().equals(cookieService.getRefreshTokenCookieName()))
                            .map(cookie -> cookie.getValue())
                            .filter(value -> value != null && !value.isBlank())
                            .findFirst();
            if (fromCookie.isPresent()) {
                return fromCookie.get();
            }
        }
        if (body != null && body.refreshToken() != null && !body.refreshToken().isBlank()) {
            return body.refreshToken();
        }
        throw new BadCredentialsException("Refresh token is missing");
    }
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
     try{
         //read refresh token
         String refreshToken = readRefreshTokenFromRequest(null,request);

         //check refresh token
         if(jwtService.isRefreshToken(refreshToken)) {
             //get jti
             String jti=jwtService.getJti(refreshToken);
             //find token
             refreshTokenRepository.findByJti(jti).ifPresent(token->{
                 //revoke token
                 token.setRevoked(true);
                 //save
                 refreshTokenRepository.save(token);
             });
         }
     }catch(Exception e){

     }
     //clear cookie
        cookieService.clearRefreshCookie(response);
     //no cache
        cookieService.addNoStoreHeaders(response);

        //clear security context
        SecurityContextHolder.clearContext();
    }


}
