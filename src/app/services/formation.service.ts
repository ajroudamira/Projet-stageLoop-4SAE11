import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Formation } from 'src/app/models/formation';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8089/api/formations'; 

  constructor(private http: HttpClient) {}

  // Récupérer toutes les formations
  getFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching formations:', error);
        return throwError(error);
      })
    );
  }

  // Créer une formation
  createFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation).pipe(
      catchError(error => {
        console.error('Error creating formation:', error);
        return throwError(error);
      })
    );
  }

  // Mettre à jour une formation
  updateFormation(idFormation: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${idFormation}`, formation).pipe(
      catchError(error => {
        console.error('Error updating formation:', error);
        return throwError(error);
      })
    );
  }

  // Supprimer une formation
  deleteFormation(idFormation: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idFormation}`).pipe(
      catchError(error => {
        console.error('Error deleting formation:', error);
        return throwError(error);
      })
    );
  }
}
