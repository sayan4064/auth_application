package com.auth_application.security;


import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth_application.auth.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;

@Service

@Getter
public class JwtService {

        private final SecretKey secretKey;
        private final long accessTokenTtlSeconds;
         private final long refreshTokenTtlSeconds;
         private final String issuer;
    public JwtService(
            @Value("${security.jwt.secret}")
            String secret,
            @Value("${security.jwt.access-ttl-seconds}")
            long accessTokenTtlSeconds,
            @Value("${security.jwt.refresh-ttl-seconds}")
            long refreshTokenTtlSeconds,
            @Value("${security.jwt.issuer}")
            String issuer
    ) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("JWT secret cannot be null or empty");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 64) {
            throw new IllegalArgumentException("JWT secret must be at least 64 bytes for HS512");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtlSeconds = accessTokenTtlSeconds;
        this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
        this.issuer = issuer;
    }

    //generate access token
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        List<String> roles = user.getRoles()==null ? List.of():user.getRoles().stream().map(role->role.getName()).toList();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenTtlSeconds)))
                .claim("email",user.getEmail())
                .claim("roles",roles)
                .claim("type","access")
                .signWith(secretKey,Jwts.SIG.HS512)
                .compact();
    }

    //genetate refresh token
    public String generateRefreshToken(User user,String jti) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTokenTtlSeconds)))
                .claim("type","refresh")
                .signWith(secretKey,Jwts.SIG.HS512)
                .compact();
    }

    //parse token

    public Jws<Claims> parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token);

    }

    //get claims
    public Claims getClaims(String token) {
        return parseToken(token).getPayload();
    }

    //get user id
    public UUID getUserId(String token) {
        String subject = getClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    //get jwt id
    public String getJti(String token) {
        return getClaims(token).getId();
    }

    //check access token
    public boolean isAccessToken(String  token) {
        String type=getClaims(token).get("type",String.class);
        return "access".equals(type);
    }

    //check refreshe token
    public boolean isRefreshToken(String  token) {
        String type=getClaims(token).get("type",String.class);
        return "refresh".equals(type);
    }

    //check expiration
    public boolean isExpired(String  token) {
       try {
            Date expiration = getClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}

