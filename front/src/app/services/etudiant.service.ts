import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../model/etudiant/etudiant.module';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private apiUrl =  `${environment.apiBaseUrl}/api/etudiants`;   // URL du backend pour les étudiants

  constructor(private http: HttpClient) {}

  // Récupérer la liste des étudiants
  getEtudiants(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.apiUrl);
  }

  // Récupérer un étudiant par son ID
  getEtudiantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel étudiant
  createEtudiant(etudiant: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, etudiant);
  }

  // Supprimer un étudiant par son ID
  deleteEtudiant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Mettre à jour un étudiant
  updateEtudiant(id: number, etudiant: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, etudiant);
  }

  // 🔍 Recherche d'étudiants
  searchEtudiants(keyword: string): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }
}
