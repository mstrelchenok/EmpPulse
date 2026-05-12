package com.oman.EmpPulse.controller;

import com.oman.EmpPulse.dto.DepartmentCreateRequest;
import com.oman.EmpPulse.dto.DepartmentUpdateRequest;
import com.oman.EmpPulse.service.DepartmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<?> listDepartments(HttpServletRequest request) {
        if (!isOwner(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody DepartmentCreateRequest req,
                                              HttpServletRequest request) {
        if (!isOwner(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        departmentService.createDepartment(req);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{departmentId}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long departmentId,
                                              @RequestBody DepartmentUpdateRequest req,
                                              HttpServletRequest request) {
        if (!isOwner(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        departmentService.updateDepartment(departmentId, req);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private boolean isOwner(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        return "OWNER".equals(session.getAttribute("USER_ROLE"));
    }
}
