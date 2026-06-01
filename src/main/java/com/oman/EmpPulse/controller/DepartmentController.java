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
        HttpSession session = request.getSession(false);
        String role = session == null ? null : (String) session.getAttribute("USER_ROLE");
        if ("OWNER".equals(role)) {
            return ResponseEntity.ok(departmentService.getAllDepartments());
        }
        if ("ADMIN".equals(role) && session != null) {
            Long userId = (Long) session.getAttribute("USER_ID");
            return ResponseEntity.ok(departmentService.getDepartmentsForAdmin(userId));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
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

    @GetMapping("/{departmentId}")
    public ResponseEntity<?> getDepartment(@PathVariable Long departmentId,
                                           HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String role = session == null ? null : (String) session.getAttribute("USER_ROLE");
        if ("OWNER".equals(role)) {
            return ResponseEntity.ok(departmentService.getDepartment(departmentId));
        }
        if ("ADMIN".equals(role) && session != null) {
            Long userId = (Long) session.getAttribute("USER_ID");
            if (departmentService.isAdminOfDepartment(userId, departmentId)) {
                return ResponseEntity.ok(departmentService.getDepartment(departmentId));
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
    }

    @DeleteMapping("/{departmentId}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long departmentId,
                                              HttpServletRequest request) {
        if (!isOwner(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("code", "FORBIDDEN", "message", "Access denied"));
        }
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.noContent().build();
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
