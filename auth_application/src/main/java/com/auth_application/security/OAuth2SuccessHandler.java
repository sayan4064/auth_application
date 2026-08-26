package com.auth_application.security;

import com.auth_application.entity.Role;
import com.auth_application.entity.Provider;
import com.auth_application.entity.RefreshToken;
import com.auth_application.entity.User;
import com.auth_application.repository.RefreshTokenRepository;
import com.auth_application.repository.RoleRepo;
import com.auth_application.repository.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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
    private final RoleRepo roleRepo;



    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // get google information
        OAuth2User oAuth2User =(OAuth2User) authentication.getPrincipal();

        String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

        String email;
        String name;
        String image;
        Provider provider;

        //google
        if("google".equalsIgnoreCase(registrationId)){
            email=oAuth2User.getAttribute("email");
            name=oAuth2User.getAttribute("name");
            image=oAuth2User.getAttribute("picture");
            provider=Provider.GOOGLE;
        } else if ("github".equalsIgnoreCase(registrationId)) {
            name=oAuth2User.getAttribute("name");
            image=oAuth2User.getAttribute("avatar_url");
            Object githubEmail=oAuth2User.getAttribute("email");
            if(githubEmail!=null){
                email=githubEmail.toString();
            }else{
                email=name+"@gmail.com";
            }
            provider=Provider.GITHUB;
        }else{
            throw new IllegalArgumentException("Unsupported provider: " + registrationId);
}

        //validate email
        if(email==null||email.isBlank()){
            throw new IllegalArgumentException("Invalid email address");
        }
        // find exixtiong user or create new user
        User user = userRepo.findByEmail(email)
                .orElseGet(() -> {

                    Role userRole = roleRepo
                            .findByName("ROLE_USER")
                            .orElseGet(() ->
                                    roleRepo.save(
                                            Role.builder()
                                                    .name("ROLE_USER")
                                                    .build()
                                    )
                            );

                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .image(image)
                            .provider(provider)
                            .enable(true)
                            .build();


                    newUser.getRoles().add(userRole);

                    return userRepo.save(newUser);
                });
        // generate access token
        String accessToken = jwtService.generateAccessToken(user);

        // generate jti
        String jti = UUID.randomUUID().toString();

        // generate refresh token
        String refreshTokenJwt = jwtService.generateRefreshToken(user, jti);

        // save refresh token in database
        Instant now = Instant.now();
        RefreshToken refreshToken = RefreshToken
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

        // put refresh token in cookie
        cookieService.attachRefreshCookie(response, refreshTokenJwt, jwtService.getRefreshTokenTtlSeconds());

        // add security header
        cookieService.addNoStoreHeaders(response);

        // return json response
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
                {
                    "message": "login successful",
                    "provider": "%s",
                    "accessToken": "%s",
                    "refreshToken": "%s"
                }
                """.formatted(provider.name(),accessToken, refreshTokenJwt
                )
        );
        response.getWriter().flush();
    }
}