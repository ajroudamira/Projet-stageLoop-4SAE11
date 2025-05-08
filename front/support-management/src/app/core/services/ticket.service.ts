import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { Ticket } from '../models/ticket.model';
import { ApiResponse } from '../models/api-response.model';
import { catchError } from 'rxjs/operators';
import { AdminRecommendation } from '../models/admin-recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private path = '/api/service/ticket';
  private useMockData = false; // Set to false to use real backend

  constructor(private apiService: ApiService) {}

  getAllTickets(page: number = 0, size: number = 10, sortBy: string = 'createdAt', direction: string = 'DESC'): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
    
    return this.apiService.get<any>(`${this.path}/all`, params)
      .pipe(
        catchError(error => {
          console.error('Error fetching tickets:', error);
          return of({ success: false, message: 'Failed to fetch tickets', data: null });
        })
      );
  }

  getTicketById(id: number): Observable<ApiResponse<Ticket>> {
    return this.apiService.get<Ticket>(`${this.path}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching ticket #${id}:`, error);
          return of({ success: false, message: 'Failed to fetch ticket details', data: null });
        })
      );
  }

  getTicketsByUser(
    username: string, 
    page: number = 0, 
    size: number = 10, 
    sortBy: string = 'createdAt', 
    direction: string = 'DESC'
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortBy);
    
    return this.apiService.get<any>(`${this.path}/user/${username}`, params)
      .pipe(
        catchError(error => {
          console.error(`Error fetching tickets for user ${username}:`, error);
          return of({ success: false, message: 'Failed to fetch user tickets', data: null });
        })
      );
  }

  createTicket(ticket: Ticket): Observable<ApiResponse<Ticket>> {
    return this.apiService.post<Ticket>(`${this.path}/create`, ticket)
      .pipe(
        catchError(error => {
          console.error('Error creating ticket:', error);
          return of({ success: false, message: 'Failed to create ticket', data: null });
        })
      );
  }

  updateTicket(ticket: Ticket): Observable<ApiResponse<Ticket>> {
    return this.apiService.put<Ticket>(`${this.path}/update/${ticket.id}`, ticket)
      .pipe(
        catchError(error => {
          console.error('Error updating ticket:', error);
          return of({ success: false, message: 'Failed to update ticket', data: null });
        })
      );
  }

  deleteTicket(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.path}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting ticket #${id}:`, error);
          return of({ success: false, message: 'Failed to delete ticket', data: null });
        })
      );
  }

  assignTicket(ticketId: number, adminUsername: string): Observable<ApiResponse<Ticket>> {
    return this.apiService.put<Ticket>(`${this.path}/${ticketId}/assign?adminUsername=${adminUsername}`, {})
      .pipe(
        catchError(error => {
          console.error(`Error assigning ticket #${ticketId} to admin ${adminUsername}:`, error);
          return of({ success: false, message: 'Failed to assign ticket', data: null });
        })
      );
  }

  unassignTicket(ticketId: number): Observable<ApiResponse<Ticket>> {
    // Pass empty string to indicate unassignment
    return this.apiService.put<Ticket>(`${this.path}/${ticketId}/assign?adminUsername=`, {})
      .pipe(
        catchError(error => {
          console.error(`Error unassigning ticket #${ticketId}:`, error);
          return of({ success: false, message: 'Failed to unassign ticket', data: null });
        })
      );
  }

  bulkAssignTickets(ticketIds: number[], adminUsername: string): Observable<ApiResponse<void>> {
    return this.apiService.post<void>(`${this.path}/bulk/assign?adminUsername=${adminUsername}`, ticketIds)
      .pipe(
        catchError(error => {
          console.error(`Error bulk assigning tickets to admin ${adminUsername}:`, error);
          return of({ success: false, message: 'Failed to assign tickets in bulk', data: null });
        })
      );
  }

  bulkUnassignTickets(ticketIds: number[]): Observable<ApiResponse<void>> {
    return this.apiService.post<void>(`${this.path}/bulk/unassign`, ticketIds)
      .pipe(
        catchError(error => {
          console.error(`Error bulk unassigning tickets:`, error);
          return of({ success: false, message: 'Failed to unassign tickets in bulk', data: null });
        })
      );
  }

  bulkChangeTicketStatus(ticketIds: number[], status: string): Observable<ApiResponse<void>> {
    return this.apiService.post<void>(`${this.path}/bulk/status?status=${status}`, ticketIds)
      .pipe(
        catchError(error => {
          console.error(`Error bulk changing tickets to status ${status}:`, error);
          return of({ success: false, message: 'Failed to change ticket status in bulk', data: null });
        })
      );
  }

  bulkChangeTicketPriority(ticketIds: number[], priority: string): Observable<ApiResponse<void>> {
    return this.apiService.put<void>(`${this.path}/bulk/priority?priority=${priority}`, ticketIds)
      .pipe(
        catchError(error => {
          console.error(`Error bulk changing tickets to priority ${priority}:`, error);
          return of({ success: false, message: 'Failed to change ticket priority in bulk', data: null });
        })
      );
  }

  bulkDeleteTickets(ticketIds: number[]): Observable<ApiResponse<void>> {
    return this.apiService.post<void>(`${this.path}/bulk/delete`, ticketIds)
      .pipe(
        catchError(error => {
          console.error(`Error bulk deleting tickets:`, error);
          return of({ success: false, message: 'Failed to delete tickets in bulk', data: null });
        })
      );
  }

  changeTicketStatus(ticketId: number, status: string): Observable<ApiResponse<Ticket>> {
    return this.apiService.put<Ticket>(`${this.path}/${ticketId}/status?status=${status}`, {})
      .pipe(
        catchError(error => {
          console.error(`Error changing status of ticket #${ticketId} to ${status}:`, error);
          return of({ success: false, message: 'Failed to change ticket status', data: null });
        })
      );
  }

  changeTicketPriority(ticketId: number, priority: string): Observable<ApiResponse<Ticket>> {
    return this.apiService.put<Ticket>(`${this.path}/${ticketId}/priority?priority=${priority}`, {})
      .pipe(
        catchError(error => {
          console.error(`Error changing priority of ticket #${ticketId} to ${priority}:`, error);
          return of({ success: false, message: 'Failed to change ticket priority', data: null });
        })
      );
  }

  // Analytics endpoints
  getTicketAnalytics(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/analytics/status`);
  }

  getTicketsByStatusForAdmin(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/analytics/status`);
  }

  getTicketsByPriorityForAdmin(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/analytics/priority`);
  }

  getCategoryAnalytics(): Observable<any> {
    return this.apiService.get<any>(`${this.path}/analytics/category`);
  }

  getResponseTimeMetrics(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/analytics/response-times`)
      .pipe(
        catchError(error => {
          console.error('Error fetching response time metrics:', error);
          return of({ success: false, message: 'Failed to fetch response time metrics', data: null });
        })
      );
  }

  getAdminRecommendations(ticketId: number): Observable<ApiResponse<AdminRecommendation[]>> {
    return this.apiService.get<AdminRecommendation[]>(`${this.path}/${ticketId}/recommendations`)
      .pipe(
        catchError(error => {
          console.error(`Error getting recommendations for ticket #${ticketId}:`, error);
          return of({ success: false, message: 'Failed to get recommendations', data: [] });
        })
      );
  }

  getTicketMetrics(ticketId: number): Observable<any> {
    return this.apiService.get<any>(`${this.path}/${ticketId}/metrics`).pipe(
      catchError(error => {
        console.error(`Error fetching metrics for ticket #${ticketId}:`, error);
        return of({ success: false, message: 'Failed to fetch ticket metrics', data: null });
      })
    );
  }

  rateTicket(ticketId: number, rating: number): Observable<any> {
    return this.apiService.post<any>(`${this.path}/${ticketId}/rate?rating=${rating}`, null).pipe(
      catchError(error => {
        console.error(`Error rating ticket #${ticketId}:`, error);
        return of({ success: false, message: 'Failed to rate ticket', data: null });
      })
    );
  }
} 