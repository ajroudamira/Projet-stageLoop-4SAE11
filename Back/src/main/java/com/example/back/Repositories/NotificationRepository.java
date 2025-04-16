package com.example.back.Repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.back.Entities.Notification;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications by user
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find unread notifications by user
    Page<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Count unread notifications by user
    long countByUserAndIsReadFalse(User user);
    
    // Find notifications for a user by username
    @Query("SELECT n FROM Notification n WHERE n.user.login = ?1 ORDER BY n.createdAt DESC")
    Page<Notification> findByUsername(String username, Pageable pageable);
    
    // Count unread notifications for a user by username
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.login = ?1 AND n.isRead = false")
    long countUnreadByUsername(String username);
    
    // Find notifications by ticket
    Page<Notification> findByTicket(Ticket ticket, Pageable pageable);
    
    // Delete all notifications for a specific ticket
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.ticket.id = :ticketId")
    void deleteByTicketId(@Param("ticketId") Long ticketId);
}
