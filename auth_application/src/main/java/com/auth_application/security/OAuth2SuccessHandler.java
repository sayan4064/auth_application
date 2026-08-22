package com.auth_application.security;

import com.auth_application.entity.Provider;
import com.auth_application.entity.RefreshToken;
import com.auth_application.entity.User;
import com.auth_application.repository.RefreshTokenRepository;
import com.auth_application.repository.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepo userRepo;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CookieService cookieService;
    private final JwtService jwtService;


    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {


        // =====================================================
        // 1. Get Google User Information
        // =====================================================

        OAuth2User oAuth2User =
                (OAuth2User) authentication.getPrincipal();

        String email =
                oAuth2User.getAttribute("email");

        String name =
                oAuth2User.getAttribute("name");

        String image =
                oAuth2User.getAttribute("picture");


        // =====================================================
        // 2. Find Existing User
        //    OR Create New Google User
        // =====================================================

        User user = userRepo
                .findByEmail(email)
                .orElseGet(() -> {

                    User newUser = User
                            .builder()
                            .email(email)
                            .name(name)
                            .image(image)
                            .provider(Provider.GOOGLE)
                            .enable(true)
                            .build();

                    return userRepo.save(newUser);
                });


        // =====================================================
        // 3. Generate Access Token
        // =====================================================

        String accessToken =
                jwtService.generateAccessToken(user);


        // =====================================================
        // 4. Generate Refresh Token JTI
        // =====================================================

        String jti =
                UUID.randomUUID().toString();


        // =====================================================
        // 5. Generate Refresh Token JWT
        // =====================================================

        String refreshTokenJwt =
                jwtService.generateRefreshToken(
                        user,
                        jti
                );


        // =====================================================
        // 6. Save Refresh Token in Database
        // =====================================================

        Instant now = Instant.now();

        RefreshToken refreshToken =
                RefreshToken
                        .builder()
                        .jti(jti)
                        .user(user)
                        .createdAt(now)
                        .expiresAt(
                                now.plusSeconds(
                                        jwtService
                                                .getRefreshTokenTtlSeconds()
                                )
                        )
                        .revoked(false)
                        .build();

        refreshTokenRepository.save(refreshToken);


        // =====================================================
        // 7. Put Refresh Token in HttpOnly Cookie
        // =====================================================

        cookieService.attachRefreshCookie(
                response,
                refreshTokenJwt,
                jwtService.getRefreshTokenTtlSeconds()
        );


        // =====================================================
        // 8. Add Security Headers
        // =====================================================

        cookieService.addNoStoreHeaders(response);


        // =====================================================
        // 9. Temporary Testing Response
        // =====================================================

        response.setStatus(
                HttpServletResponse.SC_OK
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding(
                "UTF-8"
        );


        response.getWriter().write(
                """
                {
                    "message": "Google login successful",
                    "accessToken": "%s",
                    "refreshToken": "%s"
                }
                """.formatted(
                        accessToken,
                        refreshTokenJwt
                )
        );

        response.getWriter().flush();
    }
}