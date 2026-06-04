package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.dto.UserCreateRequest;
import com.oman.EmpPulse.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        Long userId = getSessionUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("code", "UNAUTHORIZED", "message", "Not authenticated"));
        }
        return ResponseEntity.ok(userService.buildMeResponse(userId));
    }

    @PostMapping("/api/users")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest req, HttpServletRequest request) {
        String callerRole = getSessionRole(request);
        if (!"OWNER".equals(callerRole) && !"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        userService.createUser(req, callerRole);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/api/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, HttpServletRequest request) {
        if (!"OWNER".equals(getSessionRole(request))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        userService.softDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    private Long getSessionUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        return (Long) session.getAttribute("USER_ID");
    }

    private String getSessionRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        return (String) session.getAttribute("USER_ROLE");
    }
}
