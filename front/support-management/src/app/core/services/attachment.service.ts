import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { Attachment } from '../models/attachment.model';
import { ApiResponse } from '../models/api-response.model';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private path = '/attachment';
  private baseUrl = environment.apiUrl;
  private useMockData = false; // Set to false to use real backend

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  getAttachmentsByTicket(ticketId: number): Observable<ApiResponse<Attachment[]>> {
    return this.apiService.get<Attachment[]>(`${this.path}/ticket/${ticketId}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching attachments for ticket #${ticketId}:`, error);
          return of({ success: false, message: 'Failed to fetch attachments', data: null });
        })
      );
  }

  uploadAttachment(file: File, ticketId: number, userId: number): Observable<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticketId', ticketId.toString());
    formData.append('userId', userId.toString());

    return this.http.post<ApiResponse<Attachment>>(`${this.baseUrl}${this.path}/UploadAttachment`, formData)
      .pipe(
        catchError(error => {
          console.error('Error uploading attachment:', error);
          return of({ success: false, message: 'Failed to upload file', data: null });
        })
      );
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.path}/download/${attachmentId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error(`Error downloading attachment #${attachmentId}:`, error);
        return of(new Blob(['Error downloading file'], { type: 'text/plain' }));
      })
    );
  }

  deleteAttachment(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.path}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting attachment #${id}:`, error);
          return of({ success: false, message: 'Failed to delete attachment', data: null });
        })
      );
  }
} 