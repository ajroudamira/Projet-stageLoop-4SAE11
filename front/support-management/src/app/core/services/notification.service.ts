import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../models/notification.model';
import { ApiResponse } from '../models/api-response.model';
import { catchError, map, tap } from 'rxjs/operators';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private path = '/api/v1/notifications'; // Updated to new endpoint
  private useMockData = false; // Set to false to use real backend
  
  // Observable for unread count
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  constructor(
    private apiService: ApiService,
    private userProfileService: UserProfileService
  ) {
    this.refreshUnreadCount();
  }

  // New method for accessing notifications without needing a username
  getNotifications(page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.apiService.get<any>(`${this.path}`, params)
      .pipe(
        map((response: any) => {
          return this.processApiResponse(response);
        }),
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of({ success: false, message: 'Failed to fetch notifications', data: null });
        })
      );
  }

  getAllNotifications(page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    return this.getNotifications(page, size);
  }

  getNotificationsByUser(username: string, page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    console.log(`Fetching notifications for user ${username}`);
    return this.apiService.get<any>(`${this.path}/user/${username}`, params)
      .pipe(
        map((response: any) => {
          console.log('Notification response:', response);
          return this.processApiResponse(response);
        }),
        catchError(error => {
          console.error(`Error fetching notifications for user ${username}:`, error);
          return of({ success: false, message: 'Failed to fetch user notifications', data: null });
        })
      );
  }

  getUnreadNotifications(username: string, page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    console.log(`Fetching unread notifications for user ${username}`);
    return this.apiService.get<any>(`${this.path}/unread`, params)
      .pipe(
        map((response: any) => {
          console.log('Unread notification response:', response);
          return this.processApiResponse(response);
        }),
        catchError(error => {
          console.error(`Error fetching unread notifications:`, error);
          return of({ success: false, message: 'Failed to fetch unread notifications', data: null });
        })
      );
  }

  getUnreadNotificationCount(username: string = ''): Observable<ApiResponse<number>> {
    return this.apiService.get<number>(`${this.path}/count`)
      .pipe(
        map((response: any) => {
          console.log('Unread count response:', response);
          if (response && typeof response.data === 'number') {
            return response;
          } else if (typeof response === 'number') {
            return { success: true, message: 'Count retrieved successfully', data: response };
          } else {
            return { success: true, message: 'Count retrieved', data: 0 };
          }
        }),
        catchError(error => {
          console.error(`Error fetching unread notification count:`, error);
          return of({ success: false, message: 'Failed to fetch unread count', data: 0 });
        })
      );
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.apiService.put<void>(`${this.path}/${id}/read`, {})
      .pipe(
        tap(() => this.refreshUnreadCount()),
        catchError(error => {
          console.error(`Error marking notification #${id} as read:`, error);
          return of({ success: false, message: 'Failed to mark notification as read', data: null });
        })
      );
  }

  markAllAsRead(username: string = ''): Observable<ApiResponse<void>> {
    return this.apiService.put<void>(`${this.path}/read-all`, {})
      .pipe(
        tap(() => {
          // Update the unread count to zero since all are read
          this.unreadCount.next(0);
        }),
        catchError(error => {
          console.error(`Error marking all notifications as read:`, error);
          return of({ success: false, message: 'Failed to mark all notifications as read', data: null });
        })
      );
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.path}/${id}`)
      .pipe(
        tap(() => this.refreshUnreadCount()),
        catchError(error => {
          console.error(`Error deleting notification #${id}:`, error);
          return of({ success: false, message: 'Failed to delete notification', data: null });
        })
      );
  }

  deleteAllNotifications(): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.path}/delete-all`)
      .pipe(
        tap(() => {
          // Update the unread count to zero since all are gone
          this.unreadCount.next(0);
        }),
        catchError(error => {
          console.error(`Error deleting all notifications:`, error);
          return of({ success: false, message: 'Failed to delete all notifications', data: null });
        })
      );
  }

  clearAllNotifications(username: string): Observable<ApiResponse<void>> {
    return this.deleteAllNotifications();
  }

  // Refresh the unread count
  refreshUnreadCount(): void {
    this.getUnreadNotificationCount().subscribe(
      response => {
        if (response && response.success && response.data !== undefined) {
          this.unreadCount.next(response.data ?? 0);
        }
      },
      error => console.error('Error fetching notification count:', error)
    );
  }

  /**
   * Helper method to process API responses in various formats
   */
  private processApiResponse(response: any): ApiResponse<any> {
    // If it's already a proper ApiResponse object with success property
    if (response && typeof response.success === 'boolean') {
      return response;
    }
    
    // If it's a direct array of notifications
    if (Array.isArray(response)) {
      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: response
      };
    }
    
    // If it's a Spring Data Page object
    if (response && response.content && Array.isArray(response.content)) {
      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: response
      };
    }
    
    // If it's just a single notification object
    if (response && response.id) {
      return {
        success: true,
        message: 'Notification retrieved successfully',
        data: [response]
      };
    }
    
    // Default fallback
    return {
      success: false,
      message: 'Received unknown response format',
      data: null
    };
  }
} 