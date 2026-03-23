package com.kaizen.backend.admin.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Admin", description = "Administrative operations.")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Operation(summary = "Get admin dashboard data", description = "Only accessible by users with ADMIN role.")
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminDashboardResponse getDashboard() {
        return new AdminDashboardResponse("Welcome to the Admin Dashboard");
    }

    public record AdminDashboardResponse(String message) {}
}
