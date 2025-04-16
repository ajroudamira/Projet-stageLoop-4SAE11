import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-notification-management',
  templateUrl: './notification-management.component.html',
  styleUrls: ['./notification-management.component.scss']
})
export class NotificationManagementComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Admin username
  adminUsername: string = '';
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalNotifications = 0;
  totalPages = 0;
  
  // Filters
  showReadNotifications = true;
  
  // Math reference for template
  Math = Math;
  
  constructor(
    private notificationService: NotificationService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      if (user && user.login) {
        this.adminUsername = user.login;
        this.loadNotifications();
      }
    });
  }

  loadNotifications(): void {
    if (!this.adminUsername) {
      this.error = 'User information not available';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    console.log(`Loading notifications for user: ${this.adminUsername}`);
    this.notificationService.getNotifications(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        console.log('Received notification response:', response);
        if (response.success) {
          // Check for different response formats
          if (Array.isArray(response.data)) {
            // Direct array response
            this.notifications = response.data;
            this.totalNotifications = response.data.length;
            console.log(`Loaded ${this.notifications.length} notifications (array format)`);
          } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
            // Paginated response
            this.notifications = response.data.content;
            this.totalNotifications = response.data.totalElements || this.notifications.length;
            console.log(`Loaded ${this.notifications.length} notifications (paginated format), total: ${this.totalNotifications}`);
          } else if (response.data && Array.isArray(response.data.content)) {
            // Alternative paginated format
            this.notifications = response.data.content;
            this.totalNotifications = response.data.totalElements || this.notifications.length;
            console.log(`Loaded ${this.notifications.length} notifications (alternative paginated format)`);
          } else if (response.data && response.data.length > 0) {
            // Generic array-like object
            this.notifications = response.data;
            this.totalNotifications = response.data.length;
            console.log(`Loaded ${this.notifications.length} notifications (generic array-like format)`);
          } else if (response.data && typeof response.data === 'object' && response.data !== null) {
            // Single notification object
            const notificationArray = [response.data];
            this.notifications = notificationArray;
            this.totalNotifications = 1;
            console.log('Loaded single notification object');
          } else {
            // Empty or unexpected format
            this.notifications = [];
            this.totalNotifications = 0;
            console.warn('Empty or unexpected notification format:', response.data);
          }
          
          // Fix any missing properties
          this.normalizeNotifications();
          
          // Update total pages
          this.totalPages = Math.max(1, Math.ceil(this.totalNotifications / this.pageSize));
          this.applyFilters();
        } else {
          this.error = response.message || 'Failed to load notifications';
          this.notifications = [];
          this.filteredNotifications = [];
          this.totalPages = 0;
          console.error('Error in notification response:', response.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error = 'Failed to load notifications. Please try again.';
        this.isLoading = false;
        this.notifications = [];
        this.filteredNotifications = [];
        this.totalPages = 0;
      }
    });
  }
  
  // Helper method to fix missing properties in notifications
  normalizeNotifications(): void {
    this.notifications.forEach(notification => {
      // Handle legacy 'read' property
      if ((notification as any).read !== undefined && notification.isRead === undefined) {
        notification.isRead = (notification as any).read;
      } else if (notification.isRead === undefined) {
        notification.isRead = false; // Default value
      }
      
      // Ensure message exists
      if (!notification.message) {
        notification.message = 'No message content';
      }

      // Map recipient to user if needed
      if (!notification.user && (notification as any).recipient) {
        notification.user = (notification as any).recipient;
      }

      // Map relatedTicket to ticket if needed
      if (!notification.ticket && (notification as any).relatedTicket) {
        notification.ticket = (notification as any).relatedTicket;
      }

      // Handle ID mapping for tickets
      if (notification.ticket) {
        if (!notification.ticket.id && (notification.ticket as any).id_ticket) {
          notification.ticket.id = (notification.ticket as any).id_ticket;
        }
      }
    });
  }
  
  applyFilters(): void {
    if (!this.showReadNotifications) {
      this.filteredNotifications = this.notifications.filter(notification => !notification.isRead);
    } else {
      this.filteredNotifications = [...this.notifications];
    }
  }
  
  toggleReadStatus(notification: Notification): void {
    if (!notification.id) return;
    
    if (notification.isRead) {
      // In this implementation, we don't have a backend endpoint to mark as unread
      // So we'll just show a message to the user
      console.warn('Mark as unread functionality is not supported by the API');
      this.error = 'Marking as unread is not supported by the backend API';
      setTimeout(() => this.error = null, 3000);
    } else {
      // Mark as read
      console.log(`Marking notification ${notification.id} as read`);
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (response) => {
          if (response.success) {
            notification.isRead = true;
            this.applyFilters();
            this.successMessage = 'Notification marked as read';
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.error = response.message || 'Failed to mark notification as read';
            setTimeout(() => this.error = null, 3000);
          }
        },
        error: (err) => {
          console.error('Error marking notification as read:', err);
          this.error = 'Failed to mark notification as read. Please try again.';
          setTimeout(() => this.error = null, 3000);
        }
      });
    }
  }
  
  markAllAsRead(): void {
    if (!this.adminUsername) {
      this.error = 'User information not available';
      return;
    }
    
    this.notificationService.markAllAsRead(this.adminUsername).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local notification objects
          this.notifications.forEach(notification => {
            notification.isRead = true;
          });
          
          this.applyFilters();
          this.successMessage = 'All notifications marked as read';
        } else {
          this.error = response.message || 'Failed to mark all notifications as read';
        }
      },
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
        this.error = 'Failed to mark all notifications as read. Please try again.';
      }
    });
  }
  
  confirmDeleteNotification(notification: Notification): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.deleteNotification(notification);
    }
  }
  
  deleteNotification(notification: Notification): void {
    if (!notification.id) return;
    
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Remove from arrays
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.filteredNotifications = this.filteredNotifications.filter(n => n.id !== notification.id);
          this.totalNotifications--;
          this.totalPages = Math.max(1, Math.ceil(this.totalNotifications / this.pageSize));
          
          this.successMessage = 'Notification deleted successfully';
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.error = response.message || 'Failed to delete notification';
          setTimeout(() => this.error = null, 3000);
        }
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
        this.error = 'Failed to delete notification. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  confirmClearAllNotifications(): void {
    if (confirm('Are you sure you want to delete all notifications?')) {
      this.clearAllNotifications();
    }
  }
  
  clearAllNotifications(): void {
    if (!this.adminUsername) {
      this.error = 'User information not available';
      return;
    }
    
    this.notificationService.deleteAllNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          // Clear arrays
          this.notifications = [];
          this.filteredNotifications = [];
          this.totalNotifications = 0;
          this.totalPages = 1;
          
          this.successMessage = 'All notifications cleared successfully';
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.error = response.message || 'Failed to clear notifications';
          setTimeout(() => this.error = null, 3000);
        }
      },
      error: (err) => {
        console.error('Error clearing notifications:', err);
        this.error = 'Failed to clear notifications. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageIndex = newPage;
      this.loadNotifications();
    }
  }
  
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalNotifications / this.pageSize);
    const currentPage = this.pageIndex + 1;
    const pageNumbers: number[] = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show ellipsis if needed
      if (currentPage > 3) {
        pageNumbers.push(0); // 0 represents ellipsis
      }
      
      // Show current page and neighbors
      const startNeighbor = Math.max(2, currentPage - 1);
      const endNeighbor = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startNeighbor; i <= endNeighbor; i++) {
        pageNumbers.push(i);
      }
      
      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        pageNumbers.push(0); // 0 represents ellipsis
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  }
  
  hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.isRead);
  }
} 