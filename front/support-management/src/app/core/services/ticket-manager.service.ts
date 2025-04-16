import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketManagerService {
  private path = '/api/service/ticket-manager';

  constructor(private apiService: ApiService) { }

  getCurrentTicketManager(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>(`${this.path}/current`);
  }

  assignTicketManager(username: string): Observable<ApiResponse<User>> {
    return this.apiService.post<User>(`${this.path}/assign/${username}`, {});
  }

  resignAsTicketManager(): Observable<ApiResponse<User>> {
    return this.apiService.post<User>(`${this.path}/resign`, {});
  }
} 