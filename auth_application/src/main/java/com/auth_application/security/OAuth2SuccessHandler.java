package com.auth_application.security;

import com.auth_application.entity.Provider;
import com.auth_application.entity.RefreshToken;
import com.auth_application.entity.User;
import com.auth_application.repository.RefreshTokenRepository;
import com.auth_application.repository.UserRepo;
import jakarta.servlet.FilterChain;
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
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

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
        //google user information
        OAuth2User  oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email=oAuth2User.getAttribute("email");
        String name=oAuth2User.getAttribute("name");
        String image=oAuth2User.getAttribute("picture");

        User user=userRepo
                .findByEmail(email)
                .orElseGet(() ->{ User newUser=User
                        .builder()
                        .email(email)
                        .name(name)
                        .image(image)
                        .provider(Provider.GOOGLE)
                        .build();
                return userRepo.save(newUser);
                });
        //generate your jwt acccess token
        String accessToken = jwtService.generateAccessToken(user);

        //generate jti
        String jti= UUID.randomUUID().toString();
        //generate refresh token jjwt
        String refreshTokenJwt=jwtService.generateRefreshToken(user,jti);

        //save refresh token in datebase
        RefreshToken refreshToken=RefreshToken.builder()
                .jti(jti)
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now()
                        .plusSeconds(jwtService
                                .getRefreshTokenTtlSeconds()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        cookieService.attachRefreshCookie(response,refreshTokenJwt, jwtService.getRefreshTokenTtlSeconds());
        cookieService.addNoStoreHeaders(response);

        //temporary testing response
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        response.getWriter().write("""
                {
                                  "message": "Google login successful",
                                    "accessToken": "%s",
                                    "refreshToken": "%s"
                                }
                """ .formatted(accessToken,refreshToken));
    }

}
