package com.auth_application.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Service
@Getter
public class CookieService {

    private final String refreshTokenCookieName;
    private final boolean cookieSecure;
    private final boolean cookieHttpOnly;
    private final String cookieSameSite;
    private final String cookieDomain;

    public CookieService(
            @Value("${security.jwt.refresh-token-cookie-name}")
            String refreshTokenCookieName,
            @Value("${security.jwt.cookie-secure}")
            boolean cookieSecure,
            @Value("${security.jwt.cookie-http-only}")
            boolean cookieHttpOnly,
            @Value("${security.jwt.cookie-same-site}")
            String cookieSameSite,
            @Value("${security.jwt.cookie-domain:}")
            String cookieDomain
    ) {

        this.refreshTokenCookieName = refreshTokenCookieName;
        this.cookieSecure = cookieSecure;
        this.cookieHttpOnly = cookieHttpOnly;
        this.cookieSameSite = cookieSameSite;
        this.cookieDomain = cookieDomain;
    }

    // get referesh token cookie name
    public String getRefreshTokenCookieName() {
        return refreshTokenCookieName;
    }

    //attach refresh token cookie name
    public void attachRefreshCookie(HttpServletResponse response, String refreshToken, long maxAgeSeconds
    ) {
        ResponseCookie.ResponseCookieBuilder builder =
                ResponseCookie.from(refreshTokenCookieName, refreshToken)
                        .httpOnly(cookieHttpOnly)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(Duration.ofSeconds(maxAgeSeconds))
                        .sameSite(cookieSameSite);


        // Domain optional
        if (StringUtils.hasText(cookieDomain)) {
            builder.domain(cookieDomain);
        }

        ResponseCookie cookie = builder.build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    // clear refresh token cookie
    public void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(refreshTokenCookieName, "")
                        .httpOnly(cookieHttpOnly)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(Duration.ZERO)
                        .sameSite(cookieSameSite);

        // Domain optional
        if (StringUtils.hasText(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        ResponseCookie cookie = builder.build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    // no cache header
    public void addNoStoreHeaders(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
    }
}