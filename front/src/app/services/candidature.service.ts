import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CandidatureModule } from '../model/candidature/candidature.module';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl =  `${environment.apiBaseUrl}/api/candidatures`; // URL du backend

  constructor(private http: HttpClient) {}

  getAllCandidatures(): Observable<CandidatureModule[]> {
    return this.http.get<CandidatureModule[]>(this.apiUrl).pipe(
      tap(data => console.log('Données reçues:', data))
    );
  }


  getCandidatureById(id: number): Observable<CandidatureModule> { // Changez le type ici si nécessaire
    return this.http.get<CandidatureModule>(`${this.apiUrl}/${id}`);
  }

  createCandidature(candidature: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, candidature);
  }

  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  updateCandidature(id: number, candidature: CandidatureModule): Observable<CandidatureModule> {
    return this.http.put<CandidatureModule>(`${this.apiUrl}/update/${id}`, candidature);
  }
  searchCandidatures(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }
  getCvUrl(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/cv/${id}`, { responseType: 'text' }); // Assurez-vous que l'URL est correcte.
  }
  
        // Méthode pour supprimer les anciennes candidatures
  supprimerAnciennes(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer-anciennes`);
  }

  // Méthode pour vérifier les candidatures expirées
  verifierExpirees(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifier-expirees`);
  }
   // Méthode pour récupérer les candidatures expirées
   getCandidaturesExpirees(): Observable<CandidatureModule[]> {
    return this.http.get<CandidatureModule[]>(`${this.apiUrl}/expirées`).pipe(
      tap(data => console.log('Candidatures expirées reçues:', data))
    );
  }
      
   
}