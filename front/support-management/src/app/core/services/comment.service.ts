import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { Comment } from '../models/comment.model';
import { ApiResponse } from '../models/api-response.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private path = '/api/service/comment';
  private useMockData = false; // Set to false to use real backend

  constructor(private apiService: ApiService) {}

  getCommentsByTicket(
    ticketId: number, 
    page: number = 0, 
    size: number = 10
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.apiService.get<any>(`${this.path}/ticket/${ticketId}`, params)
      .pipe(
        catchError(error => {
          console.error(`Error fetching comments for ticket #${ticketId}:`, error);
          return of({ success: false, message: 'Failed to fetch comments', data: null });
        })
      );
  }

  getPublicCommentsByTicket(
    ticketId: number, 
    page: number = 0, 
    size: number = 10
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.apiService.get<any>(`${this.path}/ticket/${ticketId}/public`, params)
      .pipe(
        catchError(error => {
          console.error(`Error fetching public comments for ticket #${ticketId}:`, error);
          return of({ success: false, message: 'Failed to fetch public comments', data: null });
        })
      );
  }

  getCommentsByUser(
    userId: number, 
    page: number = 0, 
    size: number = 10
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.apiService.get<any>(`${this.path}/user/${userId}`, params)
      .pipe(
        catchError(error => {
          console.error(`Error fetching comments for user #${userId}:`, error);
          return of({ success: false, message: 'Failed to fetch user comments', data: null });
        })
      );
  }

  addComment(comment: Comment): Observable<ApiResponse<Comment>> {
    // Map frontend model to backend expected format
    const backendComment = {
      content: comment.content,
      internal: comment.internal,
      ticket: comment.ticket,
      user: comment.author
    };
    
    return this.apiService.post<Comment>(`${this.path}/AddComment`, backendComment)
      .pipe(
        catchError(error => {
          console.error('Error adding comment:', error);
          return of({ success: false, message: 'Failed to add comment', data: null });
        })
      );
  }

  updateComment(comment: Comment): Observable<ApiResponse<Comment>> {
    // Map frontend model to backend expected format
    const backendComment = {
      id: comment.id,
      content: comment.content,
      internal: comment.internal,
      ticket: comment.ticket,
      user: comment.author  // Backend expects 'user' instead of 'author'
    };
    
    return this.apiService.put<Comment>(`${this.path}/update/${comment.id}`, backendComment)
      .pipe(
        catchError(error => {
          console.error('Error updating comment:', error);
          return of({ success: false, message: 'Failed to update comment', data: null });
        })
      );
  }

  deleteComment(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.path}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting comment #${id}:`, error);
          return of({ success: false, message: 'Failed to delete comment', data: null });
        })
      );
  }
} 