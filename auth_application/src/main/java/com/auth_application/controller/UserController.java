package com.auth_application.controller;

import com.auth_application.dtos.UserDto;
import com.auth_application.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Helper method to check if the authenticated user is authorized (is the owner or an admin)
    private void checkUserOwnershipOrAdmin(String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AccessDeniedException("Unauthorized");
        }
        String currentEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }
        UserDto currentUser = userService.getUserByEmail(currentEmail);
        if (currentUser == null || !currentUser.getId().toString().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to perform this action");
        }
    }

    //get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AccessDeniedException("Unauthorized");
        }
        String currentEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !currentEmail.equals(email)) {
            throw new AccessDeniedException("You are not authorized to view this user's profile");
        }
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    //create user
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    //update user
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable String userId, @RequestBody UserDto userDto) {
        checkUserOwnershipOrAdmin(userId);
        return ResponseEntity.ok(userService.updateUser(userDto, userId));
    }

    //delete user
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        checkUserOwnershipOrAdmin(userId);
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
