package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<?> listAdmins(HttpServletRequest request) {
        if (!isOwner(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    private boolean isOwner(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        return "OWNER".equals(session.getAttribute("USER_ROLE"));
    }
}
