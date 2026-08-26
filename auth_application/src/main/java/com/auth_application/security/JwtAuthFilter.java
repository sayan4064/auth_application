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

    // jwt service for token related work
    private final JwtService jwtService;
    // repo to get user from database
    private final UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // print request details
        System.out.println("\n========== JWT FILTER ==========");
        System.out.println("REQUEST : " + request.getMethod() + " " + request.getRequestURI());
        // get authorization header
        String authHeader = request.getHeader("Authorization");
        System.out.println("AUTH HEADER EXISTS : " + (authHeader != null));
        // check if token is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // no token, so continue normally
            System.out.println("NO BEARER TOKEN -> CONTINUE");
            filterChain.doFilter(request, response);
            return;
        }
        // remove "Bearer " from the header
        String token = authHeader.substring(7);
        System.out.println("BEARER TOKEN FOUND");
        try {
            // validate and parse the jwt
            Jws<Claims> parsedToken = jwtService.parseToken(token);
            // get data stored inside token
            Claims payload = parsedToken.getPayload();
            // get token type from claims
            String type = payload.get("type", String.class);
            System.out.println("TOKEN TYPE : " + type);
            // only access token is allowed here
            if (!"access".equals(type)) {
                System.out.println("NOT ACCESS TOKEN");
                filterChain.doFilter(request, response);
                return;
            }
            // get user id from token subject
            String subject = payload.getSubject();
            System.out.println("TOKEN SUBJECT : " + subject);
            // convert subject into UUID
            UUID userId = UUID.fromString(subject);
            System.out.println("USER UUID : " + userId);
            // find user using id
            userRepo.findById(userId).ifPresentOrElse(user -> {
                System.out.println("USER FOUND : " + user.getEmail());
                System.out.println("USER ENABLED : " + user.isEnabled());
                // don't authenticate disabled user
                if (!user.isEnabled()) {
                    System.out.println("USER DISABLED");
                    return;
                }
                // get roles of the user
                List<GrantedAuthority> authorities =
                        user.getRoles() == null
                                ? List.of()
                                : user.getRoles()
                                  .stream()
                                  .map(role ->
                                       // convert role into spring authority
                                       new SimpleGrantedAuthority(role.getName())
                                  )
                                  .collect(Collectors.toList());
                System.out.println("AUTHORITIES : " + authorities);
                // create authentication object
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
                // add request details
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // save authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println(" AUTHENTICATION SET");
                // check authentication status
                System.out.println("AUTHENTICATED : " + SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
            }, () -> {
                // user id from token does not exist in database
                System.out.println(" USER NOT FOUND : " + userId);});
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // token is expired
            System.out.println(" TOKEN EXPIRED");
        } catch (io.jsonwebtoken.MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            // token is invalid or signature doesn't match
            System.out.println(" INVALID JWT : " + e.getMessage());
        } catch (Exception e) {
            // handle other jwt errors
            System.out.println(" JWT ERROR : " + e.getMessage());
            e.printStackTrace();
        }
        // check final authentication result
        System.out.println("FINAL AUTH : " + SecurityContextHolder.getContext().getAuthentication());
        System.out.println("================================\n");
        // continue to next filter/controller
        filterChain.doFilter(request, response);
    }
}