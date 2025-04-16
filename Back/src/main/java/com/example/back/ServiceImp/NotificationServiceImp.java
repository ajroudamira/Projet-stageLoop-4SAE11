package com.example.back.ServiceImp;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.Entities.Notification;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Repositories.NotificationRepository;
import com.example.back.Repositories.UserRepository;
import com.example.back.Services.NotificationService;

@Service
public class NotificationServiceImp implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationServiceImp(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Notification createNotification(String message, User user, String type, Ticket ticket) {
        Notification notification = new Notification(message, user, type, ticket);
        notification.setTitle(type);  // Explicitly set title to ensure it's populated
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public Notification createCommentNotification(User commenter, Ticket ticket, boolean isInternal) {
        // For internal comments, create notifications for admins
        if (isInternal) {
            // Find all admin users and send them notifications
            List<User> adminUsers = userRepository.findByRole("admin");
            
            // Don't notify the commenter if they're an admin
            adminUsers = adminUsers.stream()
                .filter(admin -> !admin.getId_User().equals(commenter.getId_User()))
                .collect(Collectors.toList());
            
            // Create notification for each admin
            String message = String.format("%s %s added an internal comment to ticket #%d: %s", 
                commenter.getFirstName(), commenter.getLastName(), ticket.getId(), ticket.getTitle());
            
            for (User admin : adminUsers) {
                createNotification(message, admin, "INTERNAL_COMMENT", ticket);
            }
            
            return null; // We created multiple notifications, so just return null here
        }

        // Notify the ticket creator if they exist and are not the commenter
        User ticketSubmitter = ticket.getSubmitter();
        if (ticketSubmitter != null && !ticketSubmitter.getId_User().equals(commenter.getId_User())) {
            String message = String.format("%s %s commented on your ticket: %s", 
                commenter.getFirstName(), commenter.getLastName(), ticket.getTitle());
            
            return createNotification(message, ticketSubmitter, "COMMENT", ticket);
        }
        
        return null;
    }

    @Override
    public Page<Notification> getNotificationsByUser(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    public Page<Notification> getUnreadNotificationsByUser(User user, Pageable pageable) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    public Page<Notification> getNotificationsByUsername(String username, Pageable pageable) {
        // Adjusted to handle the correct return type
        User user = userRepository.findByLogin(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        return getNotificationsByUser(user, pageable);
    }

    @Override
    public Page<Notification> getUnreadNotificationsByUsername(String username, Pageable pageable) {
        User user = userRepository.findByLogin(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        return getUnreadNotificationsByUser(user, pageable);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        // Fetch all unread notifications for this user
        Page<Notification> unreadNotifications = getUnreadNotificationsByUser(user, Pageable.unpaged());
        
        // Mark each as read
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    @Transactional
    public void markAllAsReadByUsername(String username) {
        User user = userRepository.findByLogin(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        markAllAsRead(user);
    }

    @Override
    public long countUnreadNotifications(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    public long countUnreadNotificationsByUsername(String username) {
        return notificationRepository.countUnreadByUsername(username);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(User user) {
        // Fetch all notifications for this user and delete them
        Page<Notification> notifications = getNotificationsByUser(user, Pageable.unpaged());
        notifications.forEach(notification -> notificationRepository.delete(notification));
    }

    @Override
    @Transactional
    public void deleteAllNotificationsByUsername(String username) {
        User user = userRepository.findByLogin(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        deleteAllNotifications(user);
    }

    @Override
    @Transactional
    public void deleteAllNotificationsByTicket(Ticket ticket) {
        if (ticket == null) {
            throw new RuntimeException("Ticket cannot be null");
        }
        // Find all notifications for this ticket and delete them
        Page<Notification> notifications = notificationRepository.findByTicket(ticket, Pageable.unpaged());
        notifications.forEach(notification -> notificationRepository.delete(notification));
    }

    @Override
    @Transactional
    public void deleteAllNotificationsByTicketId(Long ticketId) {
        if (ticketId == null) {
            throw new RuntimeException("Ticket ID cannot be null");
        }
        // Use the custom repository method to delete all notifications for this ticket ID
        notificationRepository.deleteByTicketId(ticketId);
    }
}
