package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.dto.LoginRequest;
import com.oman.EmpPulse.entity.User;
import com.oman.EmpPulse.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        Optional<User> userOpt = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            HttpSession session = request.getSession(true);
            session.setAttribute("USER_ID", user.getId());
            session.setAttribute("USER_ROLE", user.getRole());
            session.setAttribute("USER_THEME", user.getTheme());
            session.setAttribute("USER_LANGUAGE", user.getLanguage());
            
            return ResponseEntity.ok("Login successful");
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}
