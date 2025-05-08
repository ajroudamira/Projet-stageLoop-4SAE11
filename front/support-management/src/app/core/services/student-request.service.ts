import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentRequest {
  id?: number;
  user?: any;
  status?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentRequestService {
  private apiUrl = '/api/student-requests';

  constructor(private http: HttpClient) {}

  submitStudentRequest(request: StudentRequest): Observable<StudentRequest> {
    return this.http.post<StudentRequest>(`${this.apiUrl}`, request);
  }

  getPendingRequests(): Observable<StudentRequest[]> {
    return this.http.get<StudentRequest[]>(`${this.apiUrl}/pending`);
  }

  approveRequest(id: number): Observable<StudentRequest> {
    return this.http.post<StudentRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number, reason: string): Observable<StudentRequest> {
    return this.http.post<StudentRequest>(`${this.apiUrl}/${id}/reject`, null, { params: { reason } });
  }

  getRequestById(id: number): Observable<StudentRequest> {
    return this.http.get<StudentRequest>(`${this.apiUrl}/${id}`);
  }

  getUserRequests(user: any): Observable<StudentRequest[]> {
    return this.http.get<StudentRequest[]>(`${this.apiUrl}/my`);
  }
} 