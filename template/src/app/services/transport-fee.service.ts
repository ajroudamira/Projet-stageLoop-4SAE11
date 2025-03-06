import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransportFee {
  id: number;
  homeLocation: string;
  companyLocation: string;
  distance: number;
  fee: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransportFeeService {
  private apiUrl = 'http://localhost:8089/api/transport-fees'; // L'URL de l'API Spring Boot

  constructor(private http: HttpClient) {}

  // Méthode pour créer un frais de transport
  createTransportFee(homeLocation: string, companyLocation: string): Observable<TransportFee> {
    const body = { homeLocation, companyLocation };
    return this.http.post<TransportFee>(`${this.apiUrl}/calculate`, body);
  }

  // Méthode pour obtenir un frais de transport par ID
  getTransportFee(id: number): Observable<TransportFee> {
    return this.http.get<TransportFee>(`${this.apiUrl}/${id}`);
  }
}
