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
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain
    ) throws ServletException, IOException {
        String authheader =request.getHeader("Authorization");
        if(authheader==null||!authheader.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }

        String token=authheader.substring(7);
        
        try{
            Jws<Claims> parsedToken = jwtService.parseToken(token);
            Claims payloed = parsedToken.getPayload();
            if(!jwtService.isAccessToken(token)){
                filterChain.doFilter(request,response);
                return;

            }
            String subject = payloed.getSubject();
            UUID userId=UUID.fromString(subject);

            userRepo.findById(userId).ifPresent(user->{
                if(!user.isEnabled()){
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
                UsernamePasswordAuthenticationToken authentication=new UsernamePasswordAuthenticationToken(user.getEmail(),null,authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                if(SecurityContextHolder.getContext().getAuthentication()==null){
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            });
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("JWT token has expired: " + e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            logger.warn("Invalid JWT token signature/format: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Authentication process error", e);
        }
        filterChain.doFilter(request,response);
    }
}
