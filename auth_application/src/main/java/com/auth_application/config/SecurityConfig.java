package com.auth_application.config;

import com.auth_application.security.JwtAuthFilter;
import com.auth_application.security.OAuth2SuccessHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oauth2SuccessHandler;

    // PASSWORD ENCODER
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AUTHENTICATION MANAGER
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
    // CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // React/Vite frontend
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        // Allowed HTTP methods
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Allowed request headers
        configuration.setAllowedHeaders(List.of("*"));
        // Allow cookies / credentials
        configuration.setAllowCredentials(true);
        // Cache preflight response
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    // SECURITY FILTER CHAIN
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS
                .cors(cors -> {})
                // SESSION
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // AUTHORIZATION
                .authorizeHttpRequests(auth ->
                        auth
                                // CORS PREFLIGHT
                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                .permitAll()
                                // AUTH APIs
                                .requestMatchers(
                                        "/api/v1/auth/register",
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/refresh",
                                        "/api/v1/auth/logout"
                                ).permitAll()

                                // SWAGGER
                                .requestMatchers(
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html"
                                ).permitAll()
                                // OAUTH2
                                .requestMatchers(
                                        "/oauth2/**",
                                        "/login/**"
                                ).permitAll()
                                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                                .requestMatchers("/api/v1/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                                // EVERYTHING ELSE
                                .anyRequest()
                                .authenticated()
                )
                // OAUTH2 LOGIN
                .oauth2Login(oauth ->
                        oauth.successHandler(oauth2SuccessHandler))
                // EXCEPTION HANDLING
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(401);
                                    response.setContentType("application/json");
                                    Map<String, String> error = new HashMap<>();
                                    error.put("error", "Unauthorized access");
                                    error.put("message", authException.getMessage());
                                    response.getWriter().write(new ObjectMapper().writeValueAsString(error));
                                }
                        )
                )
                // JWT FILTER
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // CSRF
                .csrf(csrf -> csrf.disable());
        return http.build();
    }
}