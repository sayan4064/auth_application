package com.auth_application.security;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth_application.repository.UserRepo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepo userRepo;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Get Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. No Bearer token
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token
        String token = authHeader.substring(7);

        try {

            // 4. Parse token ONCE
            Jws<Claims> parsedToken =
                    jwtService.parseToken(token);

            Claims payload =
                    parsedToken.getPayload();

            // 5. Check token type
            String tokenType =
                    payload.get("type", String.class);

            if (!"access".equals(tokenType)) {

                filterChain.doFilter(request, response);
                return;
            }

            // 6. Get user ID from subject
            String subject =
                    payload.getSubject();

            UUID userId =
                    UUID.fromString(subject);

            System.out.println("JWT User ID = " + userId);
            System.out.println("JWT Email = "
                    + payload.get("email", String.class));

            // 7. Find user
            userRepo.findById(userId)
                    .ifPresentOrElse(user -> {

                        System.out.println(
                                "USER FOUND = " + user.getEmail()
                        );

                        // User disabled
                        if (!user.isEnabled()) {
                            return;
                        }

                        // 8. Authorities
                        List<GrantedAuthority> authorities =
                                user.getRoles() == null
                                        ? List.of()
                                        : user.getRoles()
                                          .stream()
                                          .map(role ->
                                               new SimpleGrantedAuthority(
                                                       role.getName()
                                               )
                                          )
                                          .collect(Collectors.toList());

                        // 9. Create Authentication
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user.getEmail(),
                                        null,
                                        authorities
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        // 10. Set SecurityContext
                        if (SecurityContextHolder
                                .getContext()
                                .getAuthentication() == null) {

                            SecurityContextHolder
                                    .getContext()
                                    .setAuthentication(
                                            authentication
                                    );
                        }

                    }, () -> {

                        System.out.println(
                                "USER NOT FOUND = " + userId
                        );
                    });

        } catch (io.jsonwebtoken.ExpiredJwtException e) {

            logger.warn("JWT expired: " + e.getMessage());

        } catch (
                io.jsonwebtoken.MalformedJwtException |
                io.jsonwebtoken.security.SignatureException e
        ) {

            logger.warn(
                    "Invalid JWT: " + e.getMessage()
            );

        } catch (Exception e) {

            logger.error(
                    "JWT authentication error",
                    e
            );
        }

        // 11. Continue
        filterChain.doFilter(request, response);
    }
}