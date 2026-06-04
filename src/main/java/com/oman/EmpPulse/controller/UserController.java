package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.dto.UserCreateRequest;
import com.oman.EmpPulse.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(userService.buildMeResponse(userId));
    }

    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    @PostMapping("/api/users")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest req, Authentication authentication) {
        String callerRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElseThrow();
        userService.createUser(req, callerRole);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('OWNER')")
    @DeleteMapping("/api/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.softDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
