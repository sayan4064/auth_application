package com.auth_application.auth.payload;

import com.auth_application.auth.entity.Provider;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private UUID id;
    private String email;
    private String name;
    private String password;
    private String image;
    private boolean enable=true;
    private Instant createdAt=Instant.now();
    private Instant updatedAt=Instant.now();
    private Provider provider;
    private Set<RoleDto> roles = new HashSet<>();
}
