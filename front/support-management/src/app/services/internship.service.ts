import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Internship {
  idInternship: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  requiredSkills: string;
  type: 'INTERNSHIP' | 'END_OF_STUDIES_PROJECT' | 'RESEARCH' | 'INDUSTRIAL';
  partner: any;
  student: any;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private apiUrl = `${environment.apiUrl}/api/internships`;

  constructor(private http: HttpClient) { }

  getAllInternships(): Observable<Internship[]> {
    return this.http.get<Internship[]>(this.apiUrl);
  }

  getInternshipById(id: number): Observable<Internship> {
    return this.http.get<Internship>(`${this.apiUrl}/${id}`);
  }

  createInternship(internship: Internship): Observable<Internship> {
    return this.http.post<Internship>(this.apiUrl, internship);
  }

  updateInternship(id: number, internship: Internship): Observable<Internship> {
    return this.http.put<Internship>(`${this.apiUrl}/${id}`, internship);
  }

  deleteInternship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getInternshipsByPartner(partnerId: number): Observable<Internship[]> {
    return this.http.get<Internship[]>(`${this.apiUrl}/partner/${partnerId}`);
  }

  getInternshipsByStudent(studentId: number): Observable<Internship[]> {
    return this.http.get<Internship[]>(`${this.apiUrl}/student/${studentId}`);
  }

  assignStudentToInternship(internshipId: number, studentId: number): Observable<Internship> {
    return this.http.post<Internship>(`${this.apiUrl}/${internshipId}/assign-student/${studentId}`, {});
  }

  updateInternshipStatus(internshipId: number, status: string): Observable<Internship> {
    return this.http.put<Internship>(`${this.apiUrl}/${internshipId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 