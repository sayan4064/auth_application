package com.auth_application.auth.repository;

import com.auth_application.auth.entity.RefreshToken;
import com.auth_application.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByJti(String jti);

    void deleteByUser(User user);
}