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

        System.out.println("\n========== JWT FILTER ==========");
        System.out.println("REQUEST : " + request.getMethod()
                + " " + request.getRequestURI());

        String authHeader =
                request.getHeader("Authorization");

        System.out.println("AUTH HEADER EXISTS : "
                + (authHeader != null));


        // No Authorization header
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "NO BEARER TOKEN -> CONTINUE"
            );

            filterChain.doFilter(request, response);
            return;
        }


        String token =
                authHeader.substring(7);

        System.out.println(
                "BEARER TOKEN FOUND"
        );


        try {

            // Parse token
            Jws<Claims> parsedToken =
                    jwtService.parseToken(token);

            Claims payload =
                    parsedToken.getPayload();


            // Token type
            String type =
                    payload.get("type", String.class);

            System.out.println(
                    "TOKEN TYPE : " + type
            );


            if (!"access".equals(type)) {

                System.out.println(
                        "NOT ACCESS TOKEN"
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // Subject
            String subject =
                    payload.getSubject();

            System.out.println(
                    "TOKEN SUBJECT : " + subject
            );


            UUID userId =
                    UUID.fromString(subject);

            System.out.println(
                    "USER UUID : " + userId
            );


            // Find user
            userRepo.findById(userId)
                    .ifPresentOrElse(user -> {

                        System.out.println(
                                "USER FOUND : "
                                        + user.getEmail()
                        );

                        System.out.println(
                                "USER ENABLED : "
                                        + user.isEnabled()
                        );


                        if (!user.isEnabled()) {

                            System.out.println(
                                    "❌ USER DISABLED"
                            );

                            return;
                        }


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


                        System.out.println(
                                "AUTHORITIES : "
                                        + authorities
                        );


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


                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(
                                        authentication
                                );


                        System.out.println(
                                "✅ AUTHENTICATION SET"
                        );

                        System.out.println(
                                "AUTHENTICATED : "
                                        + SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                                        .isAuthenticated()
                        );

                    }, () -> {

                        System.out.println(
                                "❌ USER NOT FOUND : "
                                        + userId
                        );
                    });


        } catch (io.jsonwebtoken.ExpiredJwtException e) {

            System.out.println(
                    "❌ TOKEN EXPIRED"
            );

        } catch (
                io.jsonwebtoken.MalformedJwtException |
                io.jsonwebtoken.security.SignatureException e
        ) {

            System.out.println(
                    "❌ INVALID JWT : "
                            + e.getMessage()
            );

        } catch (Exception e) {

            System.out.println(
                    "❌ JWT ERROR : "
                            + e.getMessage()
            );

            e.printStackTrace();
        }


        System.out.println(
                "FINAL AUTH : "
                        + SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );

        System.out.println(
                "================================\n"
        );


        filterChain.doFilter(
                request,
                response
        );
    }
}