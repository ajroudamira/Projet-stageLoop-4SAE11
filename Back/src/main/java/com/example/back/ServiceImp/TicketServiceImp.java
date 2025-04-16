package com.example.back.ServiceImp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.Entities.Comment;
import com.example.back.Entities.Enums.TicketCategory;
import com.example.back.Entities.Enums.TicketPriority;
import com.example.back.Entities.Enums.TicketStatus;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Repositories.TicketRepository;
import com.example.back.Repositories.UserRepository;
import com.example.back.Services.NotificationService;
import com.example.back.Services.TicketService;

@Service
public class TicketServiceImp implements TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(TicketServiceImp.class);
    
    // Explicit constructor to resolve initialization issue
    public TicketServiceImp(TicketRepository ticketRepository, NotificationService notificationService, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Override
    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public Ticket createTicket(Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // If priority is CRITICAL, notify all admins
        if (ticket.getPriority() == TicketPriority.CRITICAL) {
            notifyAdminsOfCriticalTicket(savedTicket);
        }
        
        return savedTicket;
    }

    @Override
    @Transactional
    public Ticket updateTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        try {
            // Delete all notifications related to this ticket first
            notificationService.deleteAllNotificationsByTicketId(id);
            log.info("Successfully deleted all notifications for ticket #{}", id);
            
            // Then delete the ticket
            ticketRepository.deleteById(id);
            log.info("Successfully deleted ticket #{}", id);
        } catch (Exception e) {
            log.error("Error deleting ticket #{}: {}", id, e.getMessage(), e);
            throw e; // Re-throw the exception to be handled by the controller
        }
    }

    @Override
    public Page<Ticket> getTicketsBySubmitter(User submitter, Pageable pageable) {
        return ticketRepository.findBySubmitter(submitter, pageable);
    }

    @Override
    public Page<Ticket> getTicketsByAssignedAdmin(User admin, Pageable pageable) {
        return ticketRepository.findByAssignedAdmin(admin, pageable);
    }

    @Override
    public List<Ticket> getTicketsByInternshipId(Long internshipId) {
        return ticketRepository.findByInternshipId(internshipId);
    }

    @Override
    public Page<Ticket> getTicketsByStatus(TicketStatus status, Pageable pageable) {
        return ticketRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Ticket> getTicketsByPriority(TicketPriority priority, Pageable pageable) {
        return ticketRepository.findByPriority(priority, pageable);
    }

    @Override
    public Page<Ticket> getTicketsByCategory(TicketCategory category, Pageable pageable) {
        return ticketRepository.findByCategory(category, pageable);
    }

    @Override
    @Transactional
    public Ticket updateStatus(Long id, TicketStatus status) {
        Ticket ticket = getTicketById(id);
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);
        
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        } else if (status == TicketStatus.CLOSED) {
            ticket.setClosedAt(java.time.LocalDateTime.now());
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Create notification for status change
        createNotificationForStatusChange(savedTicket, oldStatus, status);
        
        return savedTicket;
    }
    
    /**
     * Creates notifications for ticket status changes
     */
    private void createNotificationForStatusChange(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        try {
            if (notificationService == null) {
                log.warn("Could not create notification - notificationService is null");
                return;
            }
            
            // Notify the assigned admin if there is one
            if (ticket.getAssignedAdmin() != null) {
                String message = "Ticket #" + ticket.getId() + " status changed from " + oldStatus + " to " + newStatus + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    ticket.getAssignedAdmin(),
                    "STATUS_CHANGE",
                    ticket
                );
                
                log.info("Created notification for admin " + ticket.getAssignedAdmin().getLogin() + " about ticket status change");
            }
            
            // Notify the submitter
            if (ticket.getSubmitter() != null) {
                String message = "Your ticket #" + ticket.getId() + " status has changed from " + oldStatus + " to " + newStatus + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    ticket.getSubmitter(),
                    "STATUS_CHANGE",
                    ticket
                );
                
                log.info("Created notification for submitter " + ticket.getSubmitter().getLogin() + " about ticket status change");
            }
            
        } catch (Exception e) {
            // Log the error but don't prevent the status update from completing
            log.error("Error creating notification for ticket status change: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Ticket updatePriority(Long id, TicketPriority priority) {
        Ticket ticket = getTicketById(id);
        TicketPriority oldPriority = ticket.getPriority();
        ticket.setPriority(priority);
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Create notification for priority change
        createNotificationForPriorityChange(savedTicket, oldPriority, priority);
        
        return savedTicket;
    }
    
    /**
     * Creates notifications for ticket priority changes
     */
    private void createNotificationForPriorityChange(Ticket ticket, TicketPriority oldPriority, TicketPriority newPriority) {
        try {
            if (notificationService == null) {
                log.warn("Could not create notification - notificationService is null");
                return;
            }
            
            // Notify the assigned admin if there is one
            if (ticket.getAssignedAdmin() != null) {
                String message = "Ticket #" + ticket.getId() + " priority changed from " + oldPriority + " to " + newPriority + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    ticket.getAssignedAdmin(),
                    "PRIORITY_CHANGE",
                    ticket
                );
                
                log.info("Created notification for admin " + ticket.getAssignedAdmin().getLogin() + " about ticket priority change");
            }
            
            // Notify the submitter
            if (ticket.getSubmitter() != null) {
                String message = "Your ticket #" + ticket.getId() + " priority has changed from " + oldPriority + " to " + newPriority + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    ticket.getSubmitter(),
                    "PRIORITY_CHANGE",
                    ticket
                );
                
                log.info("Created notification for submitter " + ticket.getSubmitter().getLogin() + " about ticket priority change");
            }
            
            // If the priority has been changed to CRITICAL, notify all admins
            if (newPriority == TicketPriority.CRITICAL && oldPriority != TicketPriority.CRITICAL) {
                // Get all admin users
                List<User> adminUsers = userRepository.findByRole("admin");
                
                if (adminUsers.isEmpty()) {
                    log.warn("No admin users found to notify about ticket priority change to CRITICAL");
                    return;
                }
                
                // Create a notification message for all admins
                String message = "Ticket priority escalated to CRITICAL #" + ticket.getId() + ": " + ticket.getTitle();
                
                // Send notification to all admins except the assigned admin (who already got a notification)
                User assignedAdmin = ticket.getAssignedAdmin();
                for (User admin : adminUsers) {
                    // Skip if this admin is already the assigned admin for the ticket
                    if (assignedAdmin != null && admin.getId_User().equals(assignedAdmin.getId_User())) {
                        continue;
                    }
                    
                    notificationService.createNotification(
                        message,
                        admin,
                        "TICKET_ESCALATED",
                        ticket
                    );
                    
                    log.info("Created notification for admin " + admin.getLogin() + " about ticket escalated to CRITICAL");
                }
            }
            
        } catch (Exception e) {
            // Log the error but don't prevent the priority update from completing
            log.error("Error creating notification for ticket priority change: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Ticket assignAdmin(Long id, User admin) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedAdmin(admin);
        
        // Create notification for the assigned admin
        createNotificationForAssignedAdmin(ticket, admin);
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Unassigns an admin from a ticket - sets assignedAdmin to null
     */
    @Override
    @Transactional
    public Ticket unassignAdmin(Long id) {
        Ticket ticket = getTicketById(id);
        
        // Store the previously assigned admin for notification
        User previousAdmin = ticket.getAssignedAdmin();
        String adminLogin = previousAdmin != null ? previousAdmin.getLogin() : "none";
        
        log.info("Unassigning admin from ticket #{}. Previous admin: {}", id, adminLogin);
        
        // Create unassign notification before setting the admin to null
        if (previousAdmin != null) {
            createNotificationForUnassignedAdmin(ticket, previousAdmin);
        }
        
        // Set the assigned admin to null
        ticket.setAssignedAdmin(null);
        
        // Save and return the updated ticket
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Successfully unassigned admin from ticket #{}", id);
        
        return savedTicket;
    }
    
    /**
     * Creates a notification for an admin when they are assigned to a ticket
     */
    private void createNotificationForAssignedAdmin(Ticket ticket, User admin) {
        try {
            // Only create notification if we have a notificationService
            if (notificationService != null) {
                String message = "You have been assigned to ticket #" + ticket.getId() + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    admin,
                    "ASSIGNMENT",
                    ticket
                );
                
                log.info("Created notification for admin " + admin.getLogin() + " about ticket assignment");
            }
        } catch (Exception e) {
            // Log the error but don't prevent the assignment from completing
            log.error("Error creating notification for assigned admin: " + e.getMessage(), e);
        }
    }

    /**
     * Creates a notification for an admin when they are unassigned from a ticket
     */
    private void createNotificationForUnassignedAdmin(Ticket ticket, User admin) {
        try {
            // Only create notification if we have a notificationService
            if (notificationService != null) {
                String message = "You have been unassigned from ticket #" + ticket.getId() + ": " + ticket.getTitle();
                
                notificationService.createNotification(
                    message,
                    admin,
                    "UNASSIGNMENT",
                    ticket
                );
                
                log.info("Created notification for admin " + admin.getLogin() + " about ticket unassignment");
            }
        } catch (Exception e) {
            // Log the error but don't prevent the unassignment from completing
            log.error("Error creating notification for unassigned admin: " + e.getMessage(), e);
        }
    }
    
    /**
     * Notifies all administrators about a critical ticket
     */
    private void notifyAdminsOfCriticalTicket(Ticket ticket) {
        try {
            if (notificationService == null) {
                log.warn("Could not create notification - notificationService is null");
                return;
            }
            
            // Get all users - we don't have a direct method to query by role, so we'll filter
            List<User> allUsers = userRepository.findAll();
            
            // Filter to get only admins
            List<User> adminUsers = allUsers.stream()
                .filter(user -> "admin".equalsIgnoreCase(user.getRole()))
                .collect(java.util.stream.Collectors.toList());
            
            if (adminUsers.isEmpty()) {
                log.warn("No admin users found to notify about critical ticket");
                return;
            }
            
            String message = "New CRITICAL priority ticket created #" + ticket.getId() + ": " + ticket.getTitle();
            
            // Create a notification for each admin
            for (User admin : adminUsers) {
                notificationService.createNotification(
                    message,
                    admin,
                    "CRITICAL_TICKET",
                    ticket
                );
                
                log.info("Created notification for admin " + admin.getLogin() + " about critical ticket");
            }
        } catch (Exception e) {
            // Log the error but don't prevent the ticket creation from completing
            log.error("Error creating notifications for critical ticket: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void bulkUpdateStatus(List<Long> ticketIds, TicketStatus status) {
        for (Long id : ticketIds) {
            try {
                // Get the ticket and old status
                Ticket ticket = getTicketById(id);
                TicketStatus oldStatus = ticket.getStatus();
                
                // Update the status
                ticket.setStatus(status);
                if (status == TicketStatus.RESOLVED) {
                    ticket.setResolvedAt(java.time.LocalDateTime.now());
                } else if (status == TicketStatus.CLOSED) {
                    ticket.setClosedAt(java.time.LocalDateTime.now());
                }
                
                Ticket savedTicket = ticketRepository.save(ticket);
                
                // Create notification for status change
                createNotificationForStatusChange(savedTicket, oldStatus, status);
            } catch (Exception e) {
                // Log the error but continue with other tickets
                log.error("Error updating status for ticket #" + id + ": " + e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional
    public void bulkAssignAdmin(List<Long> ticketIds, User admin) {
        for (Long id : ticketIds) {
            try {
                Ticket ticket = getTicketById(id);
                ticket.setAssignedAdmin(admin);
                ticketRepository.save(ticket);
                
                // Create notification for the assigned admin
                createNotificationForAssignedAdmin(ticket, admin);
            } catch (Exception e) {
                // Log the error but continue with other tickets
                log.error("Error assigning admin to ticket #" + id + ": " + e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional
    public void bulkUnassignAdmin(List<Long> ticketIds) {
        for (Long id : ticketIds) {
            try {
                Ticket ticket = getTicketById(id);
                
                // Store previous admin for logging
                User previousAdmin = ticket.getAssignedAdmin();
                String adminLogin = previousAdmin != null ? previousAdmin.getLogin() : "none";
                
                log.info("Bulk operation: Unassigning admin from ticket #{}. Previous admin: {}", id, adminLogin);
                
                // Set assigned admin to null
                ticket.setAssignedAdmin(null);
                ticketRepository.save(ticket);
                
                log.info("Successfully unassigned admin from ticket #{} in bulk operation", id);
            } catch (Exception e) {
                // Log the error but continue with other tickets
                log.error("Error unassigning admin from ticket #" + id + ": " + e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional
    public void bulkUpdatePriority(List<Long> ticketIds, TicketPriority priority) {
        for (Long id : ticketIds) {
            try {
                // Get the ticket and old priority
                Ticket ticket = getTicketById(id);
                TicketPriority oldPriority = ticket.getPriority();
                
                // Update the priority
                ticket.setPriority(priority);
                Ticket savedTicket = ticketRepository.save(ticket);
                
                // Create notification for priority change
                createNotificationForPriorityChange(savedTicket, oldPriority, priority);
                
                log.info("Successfully updated priority to {} for ticket #{} in bulk operation", priority, id);
            } catch (Exception e) {
                // Log the error but continue with other tickets
                log.error("Error updating priority for ticket #" + id + ": " + e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional
    public void bulkDeleteTickets(List<Long> ticketIds) {
        for (Long id : ticketIds) {
            try {
                // Delete all notifications related to this ticket first
                notificationService.deleteAllNotificationsByTicketId(id);
                log.info("Successfully deleted all notifications for ticket #{} in bulk operation", id);
                
                // Then delete the ticket
                ticketRepository.deleteById(id);
                log.info("Successfully deleted ticket #{} in bulk operation", id);
            } catch (Exception e) {
                // Log the error but continue with other tickets
                log.error("Error deleting ticket #{}: {}", id, e.getMessage(), e);
            }
        }
    }

    @Override
    public Long getTicketCountByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }

    @Override
    public Long getTicketCountByPriority(TicketPriority priority) {
        return ticketRepository.countByPriority(priority);
    }

    @Override
    public Long getTicketCountByCategory(TicketCategory category) {
        return ticketRepository.countByCategory(category);
    }

    @Override
    public Map<String, Double> calculateResponseTimeMetrics() {
        List<Ticket> resolvedTickets = ticketRepository.findByStatus(TicketStatus.RESOLVED);
        List<Ticket> closedTickets = ticketRepository.findByStatus(TicketStatus.CLOSED);
        
        // Combine resolved and closed tickets for metrics calculation
        List<Ticket> completedTickets = new ArrayList<>();
        completedTickets.addAll(resolvedTickets);
        completedTickets.addAll(closedTickets);
        
        if (completedTickets.isEmpty()) {
            return Map.of(
                "avgResponseTime", 0.0,
                "avgResolutionTime", 0.0
            );
        }
        
        double totalResponseTime = 0;
        double totalResolutionTime = 0;
        int count = 0;
        
        for (Ticket ticket : completedTickets) {
            // Calculate response time (time from creation to first admin comment)
            LocalDateTime firstAdminCommentTime = ticket.getComments().stream()
                .filter(comment -> "admin".equals(comment.getUser().getRole()))
                .map(Comment::getCreatedAt)
                .min(LocalDateTime::compareTo)
                .orElse(ticket.getResolvedAt());
                
            if (firstAdminCommentTime != null) {
                long responseTimeHours = java.time.Duration.between(ticket.getCreatedAt(), firstAdminCommentTime).toHours();
                totalResponseTime += responseTimeHours;
            }
            
            // Calculate resolution time (time from creation to resolution)
            if (ticket.getResolvedAt() != null) {
                long resolutionTimeHours = java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours();
                totalResolutionTime += resolutionTimeHours;
                count++;
            }
        }
        
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("avgResponseTime", count > 0 ? totalResponseTime / count : 0.0);
        metrics.put("avgResolutionTime", count > 0 ? totalResolutionTime / count : 0.0);
        
        return metrics;
    }
}
