package com.example.back.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.Entities.User;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.Services.UserService;

@RestController
@RequestMapping("/api/service/ticket-manager")
public class TicketManagerController {

    private final UserService userService;

    public TicketManagerController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/current")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getCurrentTicketManager() {
        try {
            User ticketManager = userService.findByIsTicketManager(true);
            ApiResponse response = new ApiResponse(true, "Current ticket manager retrieved successfully");
            response.setData(ticketManager);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/assign/{username}")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> assignTicketManager(@PathVariable String username) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Get target user
            User targetUser = userService.GetUserByUserName(username);
            if (targetUser == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }

            // Check if current user is the ticket manager
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Only the current ticket manager can assign this role"));
            }

            // Update roles
            currentUser.setTicketManager(false);
            targetUser.setTicketManager(true);

            userService.UpdateUser(currentUser);
            userService.UpdateUser(targetUser);

            ApiResponse response = new ApiResponse(true, "Ticket manager role assigned successfully");
            response.setData(targetUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resign")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> resignAsTicketManager() {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Check if current user is the ticket manager
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "You are not the current ticket manager"));
            }

            // Remove ticket manager role
            currentUser.setTicketManager(false);
            userService.UpdateUser(currentUser);

            ApiResponse response = new ApiResponse(true, "Successfully resigned as ticket manager");
            response.setData(currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 