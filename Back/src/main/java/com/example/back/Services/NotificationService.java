package com.example.back.Services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.back.Entities.Notification;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;

public interface NotificationService {
    
    // Create a notification
    Notification createNotification(String message, User user, String type, Ticket ticket);
    
    // Create a notification for a ticket comment
    Notification createCommentNotification(User commenter, Ticket ticket, boolean isInternal);
    
    // Get notifications for a user
    Page<Notification> getNotificationsByUser(User user, Pageable pageable);
    
    // Get unread notifications for a user
    Page<Notification> getUnreadNotificationsByUser(User user, Pageable pageable);
    
    // Get notifications for a user by username
    Page<Notification> getNotificationsByUsername(String username, Pageable pageable);
    
    // Get unread notifications for a user by username
    Page<Notification> getUnreadNotificationsByUsername(String username, Pageable pageable);
    
    // Mark a notification as read
    Notification markAsRead(Long notificationId);
    
    // Mark all notifications as read for a user
    void markAllAsRead(User user);
    
    // Mark all notifications as read for a user by username
    void markAllAsReadByUsername(String username);
    
    // Count unread notifications for a user
    long countUnreadNotifications(User user);
    
    // Count unread notifications for a user by username
    long countUnreadNotificationsByUsername(String username);
    
    // Delete a notification
    void deleteNotification(Long notificationId);
    
    // Delete all notifications for a user
    void deleteAllNotifications(User user);
    
    // Delete all notifications for a user by username
    void deleteAllNotificationsByUsername(String username);
    
    // Delete all notifications for a ticket
    void deleteAllNotificationsByTicket(Ticket ticket);
    
    // Delete all notifications for a ticket by ID
    void deleteAllNotificationsByTicketId(Long ticketId);
}
