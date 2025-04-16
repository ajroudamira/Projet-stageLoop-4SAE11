package com.example.back.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.Entities.Notification;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.Services.NotificationService;

@RestController
@RequestMapping("/api/service/api/v1/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getUserNotifications(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        try {
            Page<Notification> notifications = notificationService.getNotificationsByUsername(username, pageable);
            ApiResponse response = new ApiResponse(true, "Notifications retrieved successfully");
            response.setData(notifications);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error retrieving notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse> getUnreadNotifications(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        try {
            Page<Notification> notifications = notificationService.getUnreadNotificationsByUsername(username, pageable);
            ApiResponse response = new ApiResponse(true, "Unread notifications retrieved successfully");
            response.setData(notifications);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error retrieving unread notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse> getUnreadNotificationCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        try {
            long count = notificationService.countUnreadNotificationsByUsername(username);
            ApiResponse response = new ApiResponse(true, "Unread notification count retrieved successfully");
            response.setData(count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error retrieving unread notification count: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markNotificationAsRead(@PathVariable Long id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            ApiResponse response = new ApiResponse(true, "Notification marked as read successfully");
            response.setData(notification);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error marking notification as read: " + e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllNotificationsAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        try {
            notificationService.markAllAsReadByUsername(username);
            return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error marking all notifications as read: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(new ApiResponse(true, "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error deleting notification: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<ApiResponse> deleteAllNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        try {
            notificationService.deleteAllNotificationsByUsername(username);
            return ResponseEntity.ok(new ApiResponse(true, "All notifications deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error deleting all notifications: " + e.getMessage()));
        }
    }
}
