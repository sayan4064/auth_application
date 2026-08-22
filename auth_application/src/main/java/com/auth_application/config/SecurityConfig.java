package com.auth_application.config;

import com.auth_application.security.JwtAuthFilter;
import com.auth_application.security.OAuth2SuccessHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private final JwtAuthFilter  jwtAuthFilter;
    private final OAuth2SuccessHandler oauth2SuccessHandler;
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
    @Bean
    public SecurityFilterChain  securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(session->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests( auth ->
                        auth
                                .requestMatchers(
                                        "/api/v1/auth/register",
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/refresh",
                                        "/api/v1/auth/logout",
                                        "/oauth2/**",
                                        "/login/**"

                                ).permitAll()
                        .anyRequest().authenticated()
                         )
                .oauth2Login(oauth->oauth.successHandler(oauth2SuccessHandler))
                .exceptionHandling(ex->
                        ex.authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            Map<String , String > error = new HashMap<>();
                            error.put("error","Unauthorized access");
                            error.put("message",authException.getMessage());
                            response.getWriter().write(new ObjectMapper().writeValueAsString(error));
                        }))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf->csrf.disable());

        return http.build();
    }
}
