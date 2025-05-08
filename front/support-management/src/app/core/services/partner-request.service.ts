import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartnerRequest {
  id?: number;
  userId?: number;
  companyName: string;
  businessSector: string;
  motivation: string;
  status?: string;
  rejectionReason?: string;
  companySize?: string;
  yearsInBusiness?: number;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  companyDescription?: string;
  website?: string;
  linkedinProfile?: string;
  internshipPositions?: string;
  internshipTypes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PartnerRequestService {
  private apiUrl = '/api/partner-requests';

  constructor(private http: HttpClient) {}

  submitPartnerRequest(request: PartnerRequest): Observable<PartnerRequest> {
    return this.http.post<PartnerRequest>(`${this.apiUrl}`, request);
  }

  getMyRequests(): Observable<PartnerRequest[]> {
    return this.http.get<PartnerRequest[]>(`${this.apiUrl}/my`);
  }

  getPendingRequests(): Observable<PartnerRequest[]> {
    return this.http.get<PartnerRequest[]>(`${this.apiUrl}/pending`);
  }

  approveRequest(id: number): Observable<PartnerRequest> {
    return this.http.post<PartnerRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number, reason: string): Observable<PartnerRequest> {
    return this.http.post<PartnerRequest>(`${this.apiUrl}/${id}/reject`, null, { params: { reason } });
  }

  getRequestById(id: number): Observable<PartnerRequest> {
    return this.http.get<PartnerRequest>(`${this.apiUrl}/${id}`);
  }
} 