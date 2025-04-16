import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:3000'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getCategoryAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/category`);
  }

  getResponseTimeMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/response-times`);
  }
} 