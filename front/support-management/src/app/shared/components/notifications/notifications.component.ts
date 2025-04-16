import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  loading = false;
  currentPage = 0;
  pageSize = 5;
  totalNotifications = 0;
  showOnlyUnread = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe(
      response => {
        if (response && response.success && response.data) {
          this.notifications = response.data.content || [];
          this.totalNotifications = response.data.totalElements || 0;
          this.applyFilter();
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading notifications', error);
        this.loading = false;
      }
    );
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.loadNotifications();
    }
  }

  toggleReadFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.showOnlyUnread = !this.showOnlyUnread;
    console.log('Toggle read filter - showOnlyUnread:', this.showOnlyUnread);
    this.applyFilter();
  }

  applyFilter(): void {
    console.log('Applying filter - showOnlyUnread:', this.showOnlyUnread);
    console.log('Total notifications:', this.notifications.length);
    
    if (this.showOnlyUnread) {
      this.filteredNotifications = this.notifications.filter(notification => {
        const isUnread = !notification.isRead;
        console.log(`Notification ${notification.id}: isRead=${notification.isRead}, include=${isUnread}`);
        return isUnread;
      });
    } else {
      this.filteredNotifications = [...this.notifications];
    }
    
    console.log('Filtered notifications count:', this.filteredNotifications.length);
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(
        () => {
          notification.isRead = true;
          this.notificationService.refreshUnreadCount();
          this.applyFilter();
        },
        error => console.error('Error marking notification as read', error)
      );
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe(
      () => {
        this.notifications.forEach(notification => notification.isRead = true);
        this.notificationService.refreshUnreadCount();
        this.applyFilter();
      },
      error => console.error('Error marking all notifications as read', error)
    );
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe(
      () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.applyFilter();
        this.notificationService.refreshUnreadCount();
      },
      error => console.error('Error deleting notification', error)
    );
  }

  deleteAllNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteAllNotifications().subscribe(
      () => {
        this.notifications = [];
        this.filteredNotifications = [];
        this.notificationService.refreshUnreadCount();
      },
      error => console.error('Error deleting all notifications', error)
    );
  }

  navigateToTicket(notification: Notification): void {
    if (notification.ticket) {
      this.markAsRead(notification, new Event('click'));
      this.showDropdown = false;
      this.router.navigate(['/tickets', notification.ticket.id]);
    }
  }

  loadMore(): void {
    this.currentPage++;
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe(
      response => {
        if (response && response.success && response.data && response.data.content) {
          this.notifications = [...this.notifications, ...response.data.content];
          this.applyFilter();
        }
      },
      error => console.error('Error loading more notifications', error)
    );
  }
} 