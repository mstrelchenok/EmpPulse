package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<?> listEmployees(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String role = session == null ? null : (String) session.getAttribute("USER_ROLE");
        if ("OWNER".equals(role)) {
            return ResponseEntity.ok(employeeService.getAllEmployees());
        }
        if ("ADMIN".equals(role) && session != null) {
            Long userId = (Long) session.getAttribute("USER_ID");
            return ResponseEntity.ok(employeeService.getEmployeesForAdmin(userId));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
    }
}
