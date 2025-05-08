package com.example.back.Controllers;

import com.example.back.Entities.Enums.TicketCategory;
import com.example.back.Entities.Enums.TicketPriority;
import com.example.back.Entities.Enums.TicketStatus;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Entities.Comment;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.Services.TicketService;
import com.example.back.Services.UserService;
import com.example.back.Services.TicketRecommendationService;
import com.example.back.Models.AdminRecommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/service/ticket")
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;
    private final TicketRecommendationService recommendationService;
    private static final Logger log = LoggerFactory.getLogger(TicketController.class);
    
    // Explicit constructor to resolve initialization issue
    public TicketController(TicketService ticketService, UserService userService, TicketRecommendationService recommendationService) {
        this.ticketService = ticketService;
        this.userService = userService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Ticket> tickets = ticketService.getAllTickets(pageable);
            
            ApiResponse response = new ApiResponse(true, "Tickets retrieved successfully");
            response.setData(tickets);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> createTicket(@RequestBody Ticket ticket) {
        try {
            Ticket createdTicket = ticketService.createTicket(ticket);
            ApiResponse response = new ApiResponse(true, "Ticket created successfully");
            response.setData(createdTicket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> updateTicket(@PathVariable Long id, @RequestBody Ticket ticket) {
        try {
            Ticket existingTicket = ticketService.getTicketById(id);
            // Update fields except id
            existingTicket.setTitle(ticket.getTitle());
            existingTicket.setDescription(ticket.getDescription());
            existingTicket.setStatus(ticket.getStatus());
            existingTicket.setPriority(ticket.getPriority());
            existingTicket.setCategory(ticket.getCategory());
            existingTicket.setSubmitter(ticket.getSubmitter());
            existingTicket.setAssignedAdmin(ticket.getAssignedAdmin());
            existingTicket.setInternshipId(ticket.getInternshipId());

            Ticket updatedTicket = ticketService.updateTicket(existingTicket);
            ApiResponse response = new ApiResponse(true, "Ticket updated successfully");
            response.setData(updatedTicket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getTicket(@PathVariable Long id) {
        try {
            Ticket ticket = ticketService.getTicketById(id);
            ApiResponse response = new ApiResponse(true, "Ticket retrieved successfully");
            response.setData(ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> deleteTicket(@PathVariable Long id) {
        try {
            // Get the current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);
            
            // Get the ticket
            Ticket ticket = ticketService.getTicketById(id);
            
            // Check if user is ticket manager or the ticket submitter
            boolean isTicketManager = currentUser.isTicketManager();
            boolean isSubmitter = ticket.getSubmitter().getId_User().equals(currentUser.getId_User());
            
            // If user is not ticket manager and not the submitter, deny access
            if (!isTicketManager && !isSubmitter) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "You can only delete your own tickets"));
            }
            
            // If user is submitter but not ticket manager, check if ticket is OPEN
            if (!isTicketManager && isSubmitter && ticket.getStatus() != TicketStatus.OPEN) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "You can only delete tickets with OPEN status"));
            }
            
            // Delete the ticket
            ticketService.deleteTicket(id);
            ApiResponse response = new ApiResponse(true, "Ticket deleted successfully");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyAuthority('admin', 'user', 'student', 'partner')")
    public ResponseEntity<ApiResponse> getTicketsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        try {
            User user = userService.GetUserByUserName(username);
            Pageable pageable;
            if (sort != null && !sort.isEmpty()) {
                pageable = PageRequest.of(page, size, Sort.by(sort));
            } else {
                pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            }
            Page<Ticket> tickets = ticketService.getTicketsBySubmitter(user, pageable);
            ApiResponse response = new ApiResponse(true, "Tickets retrieved successfully");
            response.setData(tickets);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/{username}")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getTicketsByAdmin(@PathVariable String username, Pageable pageable) {
        try {
            User admin = userService.GetUserByUserName(username);
            Page<Ticket> tickets = ticketService.getTicketsByAssignedAdmin(admin, pageable);
            ApiResponse response = new ApiResponse(true, "Tickets retrieved successfully");
            response.setData(tickets);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/internship/{internshipId}")
    @PreAuthorize("hasAnyAuthority('admin', 'partner')")
    public ResponseEntity<ApiResponse> getTicketsByInternship(@PathVariable Long internshipId) {
        try {
            List<Ticket> tickets = ticketService.getTicketsByInternshipId(internshipId);
            ApiResponse response = new ApiResponse(true, "Tickets retrieved successfully");
            response.setData(tickets);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id, @RequestParam TicketStatus status) {
        try {
            Ticket ticket = ticketService.updateStatus(id, status);
            ApiResponse response = new ApiResponse(true, "Status updated successfully");
            response.setData(ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> updatePriority(@PathVariable Long id, @RequestParam TicketPriority priority) {
        try {
            Ticket ticket = ticketService.updatePriority(id, priority);
            ApiResponse response = new ApiResponse(true, "Priority updated successfully");
            response.setData(ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> assignAdmin(@PathVariable Long id, @RequestParam String adminUsername) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Check if current user is the ticket manager
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Only the ticket manager can assign tickets"));
            }

            Ticket ticket;
            
            // Check if the adminUsername is empty - this means we want to unassign
            if (adminUsername == null || adminUsername.trim().isEmpty()) {
                log.info("Unassigning ticket with ID: {}", id);
                ticket = ticketService.unassignAdmin(id);
                ApiResponse response = new ApiResponse(true, "Ticket unassigned successfully");
                response.setData(ticket);
                return ResponseEntity.ok(response);
            } else {
                // Normal assignment flow
                User admin = userService.GetUserByUserName(adminUsername);
                ticket = ticketService.assignAdmin(id, admin);
                ApiResponse response = new ApiResponse(true, "Admin assigned successfully");
                response.setData(ticket);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bulk/status")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkUpdateStatus(@RequestBody List<Long> ticketIds, @RequestParam TicketStatus status) {
        try {
            ticketService.bulkUpdateStatus(ticketIds, status);
            ApiResponse response = new ApiResponse(true, "Status updated successfully for multiple tickets");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bulk/assign")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkAssignAdmin(@RequestBody List<Long> ticketIds, @RequestParam String adminUsername) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Check if current user is the ticket manager
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Only the ticket manager can assign tickets"));
            }

            User admin = userService.GetUserByUserName(adminUsername);
            ticketService.bulkAssignAdmin(ticketIds, admin);
            ApiResponse response = new ApiResponse(true, "Admin assigned successfully for multiple tickets");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bulk/unassign")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkUnassignAdmin(@RequestBody List<Long> ticketIds) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Check if current user is the ticket manager
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Only the ticket manager can unassign tickets"));
            }

            log.info("Bulk unassigning {} tickets", ticketIds.size());
            ticketService.bulkUnassignAdmin(ticketIds);
            ApiResponse response = new ApiResponse(true, "Tickets successfully unassigned");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during bulk unassignment: {}", e.getMessage(), e);
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bulk/priority")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkUpdatePriority(@RequestBody List<Long> ticketIds, @RequestParam TicketPriority priority) {
        try {
            log.info("Bulk updating priority to {} for {} tickets", priority, ticketIds.size());
            ticketService.bulkUpdatePriority(ticketIds, priority);
            ApiResponse response = new ApiResponse(true, "Priority updated successfully for multiple tickets");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during bulk priority update: {}", e.getMessage(), e);
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bulk/delete")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkDeleteTickets(@RequestBody List<Long> ticketIds) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.GetUserByUserName(currentUsername);

            // Only ticket manager can perform bulk delete
            if (!currentUser.isTicketManager()) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Only the ticket manager can perform bulk delete operations"));
            }

            ticketService.bulkDeleteTickets(ticketIds);
            ApiResponse response = new ApiResponse(true, "Tickets deleted successfully");
            response.setData(null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/bulk/priority")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> bulkUpdatePriorityPut(@RequestBody List<Long> ticketIds, @RequestParam TicketPriority priority) {
        // Delegate to the POST method implementation
        return bulkUpdatePriority(ticketIds, priority);
    }

    @GetMapping("/analytics/status")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getStatusAnalytics() {
        try {
            var analytics = new java.util.HashMap<TicketStatus, Long>();
            for (TicketStatus status : TicketStatus.values()) {
                analytics.put(status, ticketService.getTicketCountByStatus(status));
            }
            ApiResponse response = new ApiResponse(true, "Status analytics retrieved successfully");
            response.setData(analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/analytics/priority")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getPriorityAnalytics() {
        try {
            var analytics = new java.util.HashMap<TicketPriority, Long>();
            for (TicketPriority priority : TicketPriority.values()) {
                analytics.put(priority, ticketService.getTicketCountByPriority(priority));
            }
            ApiResponse response = new ApiResponse(true, "Priority analytics retrieved successfully");
            response.setData(analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/analytics/category")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getCategoryAnalytics() {
        try {
            var analytics = new java.util.HashMap<TicketCategory, Long>();
            for (TicketCategory category : TicketCategory.values()) {
                analytics.put(category, ticketService.getTicketCountByCategory(category));
            }
            ApiResponse response = new ApiResponse(true, "Category analytics retrieved successfully");
            response.setData(analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/analytics/response-times")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getResponseTimeMetrics() {
        try {
            Map<String, Double> metrics = ticketService.calculateResponseTimeMetrics();
            ApiResponse response = new ApiResponse(true, "Response time metrics retrieved successfully");
            response.setData(metrics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<ApiResponse> getAdminRecommendations(@PathVariable Long id) {
        try {
            // Get the ticket
            Ticket ticket = ticketService.getTicketById(id);
            
            // Get recommendations based on description
            List<AdminRecommendation> recommendations = recommendationService.getAdminRecommendations(ticket.getDescription());
            
            // The 'exists' flag in each AdminRecommendation indicates if the recommended admin exists in the system.
            // Frontend should use this flag to disable or hide the Assign button for non-existing admins.
            ApiResponse response = new ApiResponse(true, "Admin recommendations retrieved successfully");
            response.setData(recommendations);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ApiResponse response = new ApiResponse(false, e.getMessage());
            response.setData(null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/metrics")
    @PreAuthorize("hasAuthority('admin') or hasAuthority('user') or hasAuthority('partner') or hasAuthority('student')")
    public ResponseEntity<?> getTicketMetrics(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        Map<String, Object> metrics = new HashMap<>();
        // First response time
        Optional<LocalDateTime> firstAdminComment = ticket.getComments().stream()
            .filter(c -> c.getUser() != null && "admin".equalsIgnoreCase(c.getUser().getRole()))
            .map(Comment::getCreatedAt)
            .min(LocalDateTime::compareTo);
        metrics.put("firstResponseTime", firstAdminComment.isPresent() ?
            java.time.Duration.between(ticket.getCreatedAt(), firstAdminComment.get()).toHours() : null);
        // Resolution time
        metrics.put("resolutionTime", ticket.getResolvedAt() != null ?
            java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours() : null);
        // Customer satisfaction
        metrics.put("customerSatisfaction", ticket.getCustomerSatisfaction());
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("hasAuthority('user') or hasAuthority('partner') or hasAuthority('student')")
    public ResponseEntity<?> rateTicket(@PathVariable Long id, @RequestParam Integer rating) {
        Ticket ticket = ticketService.getTicketById(id);
        ticket.setCustomerSatisfaction(rating);
        ticketService.updateTicket(ticket);
        return ResponseEntity.ok().build();
    }
}
