package com.example.back.Repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back.Entities.Enums.TicketCategory;
import com.example.back.Entities.Enums.TicketPriority;
import com.example.back.Entities.Enums.TicketStatus;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findBySubmitter(User submitter, Pageable pageable);
    Page<Ticket> findByAssignedAdmin(User admin, Pageable pageable);
    List<Ticket> findByInternshipId(Long internshipId);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);
    Page<Ticket> findByCategory(TicketCategory category, Pageable pageable);
    Long countByStatus(TicketStatus status);
    Long countByPriority(TicketPriority priority);
    Long countByCategory(TicketCategory category);
    
    // Find tickets by status without pagination
    List<Ticket> findByStatus(TicketStatus status);
}
