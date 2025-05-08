import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Candidature } from '../models/candidature.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private baseUrl = `${environment.apiUrl}/candidature`;

  constructor(private http: HttpClient) { }

  // Student methods
  addCandidature(candidature: Candidature): Observable<ApiResponse<Candidature>> {
    return this.http.post<ApiResponse<Candidature>>(`${this.baseUrl}`, candidature);
  }

  updateCandidature(id: number, candidature: Candidature): Observable<ApiResponse<Candidature>> {
    return this.http.put<ApiResponse<Candidature>>(`${this.baseUrl}/${id}`, candidature);
  }

  deleteCandidature(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getMyCandidatures(): Observable<ApiResponse<Candidature[]>> {
    return this.http.get<ApiResponse<Candidature[]>>(`${this.baseUrl}/my`);
  }

  // Admin methods
  getAllCandidatures(): Observable<ApiResponse<Candidature[]>> {
    return this.http.get<ApiResponse<Candidature[]>>(`${this.baseUrl}`);
  }

  adminUpdateCandidature(id: number, candidature: Candidature): Observable<ApiResponse<Candidature>> {
    return this.http.put<ApiResponse<Candidature>>(`${this.baseUrl}/admin/${id}`, candidature);
  }

  adminDeleteCandidature(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/${id}`);
  }

  searchCandidatures(keyword: string): Observable<ApiResponse<Candidature[]>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Candidature[]>>(`${this.baseUrl}/search`, { params });
  }

  // File handling
  uploadFile(file: File): Observable<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileUrl: string }>(`${this.baseUrl}/upload`, formData);
  }

  getFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/cv/${filename}`, { responseType: 'blob' });
  }

  // Expired candidatures management
  checkExpiredCandidatures(): Observable<ApiResponse<void>> {
    return this.http.get<ApiResponse<void>>(`${this.baseUrl}/check-expired`);
  }

  deleteOldCandidatures(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/delete-old`);
  }

  getExpiredCandidatures(): Observable<ApiResponse<Candidature[]>> {
    return this.http.get<ApiResponse<Candidature[]>>(`${this.baseUrl}/expired`);
  }

  getCandidaturesByPartner(): Observable<ApiResponse<Candidature[]>> {
    return this.http.get<ApiResponse<Candidature[]>>(`${this.baseUrl}/partner/my-candidatures`);
  }

  updateCandidatureStatusByPartner(id: number, status: string): Observable<ApiResponse<Candidature>> {
    return this.http.put<ApiResponse<Candidature>>(`${this.baseUrl}/partner/candidature/${id}`, { status });
  }
} 