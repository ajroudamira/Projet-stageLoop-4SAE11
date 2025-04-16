package com.example.back.Services;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.back.Entities.Enums.TicketCategory;
import com.example.back.Entities.Enums.TicketPriority;
import com.example.back.Entities.Enums.TicketStatus;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;

public interface TicketService {
    Ticket createTicket(Ticket ticket);
    Ticket updateTicket(Ticket ticket);
    Ticket getTicketById(Long id);
    void deleteTicket(Long id);

    // Get all tickets with pagination
    Page<Ticket> getAllTickets(Pageable pageable);

    // Filtering methods
    Page<Ticket> getTicketsBySubmitter(User submitter, Pageable pageable);
    Page<Ticket> getTicketsByAssignedAdmin(User admin, Pageable pageable);
    List<Ticket> getTicketsByInternshipId(Long internshipId);
    Page<Ticket> getTicketsByStatus(TicketStatus status, Pageable pageable);
    Page<Ticket> getTicketsByPriority(TicketPriority priority, Pageable pageable);
    Page<Ticket> getTicketsByCategory(TicketCategory category, Pageable pageable);

    // Admin specific methods
    Ticket assignAdmin(Long id, User admin);
    Ticket unassignAdmin(Long id);
    Ticket updateStatus(Long id, TicketStatus status);
    Ticket updatePriority(Long id, TicketPriority priority);

    // Bulk operations
    void bulkUpdateStatus(List<Long> ticketIds, TicketStatus status);
    void bulkAssignAdmin(List<Long> ticketIds, User admin);
    void bulkUnassignAdmin(List<Long> ticketIds);
    void bulkUpdatePriority(List<Long> ticketIds, TicketPriority priority);
    void bulkDeleteTickets(List<Long> ticketIds);

    // Analytics methods
    Long getTicketCountByStatus(TicketStatus status);
    Long getTicketCountByPriority(TicketPriority priority);
    Long getTicketCountByCategory(TicketCategory category);

    // Metrics methods
    Map<String, Double> calculateResponseTimeMetrics();
}
