import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entreprise } from '../entreprise/entreprise.module';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

 
  private apiUrl = 'http://localhost:8089/louay/api/entreprises';  

  constructor(private http: HttpClient) { }

  getEntreprises(): Observable<Entreprise[] > {
    return this.http.get<Entreprise[]>(this.apiUrl+"/Afiicher tous les entreprise");
  }
  getEntrepriseById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/Afficher/${id}`);
  }
  

  addEntreprise(entreprise:any): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl + '/ajouter', entreprise);  
  }
   

  updateEntreprise(id: number, entreprise: Entreprise): Observable<Entreprise> {
      return this.http.put<Entreprise>(`${this.apiUrl}/modifer entreprise/${id}`, entreprise);
  }
  

  deleteEntreprise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supprimer entreprise/${id}`);
  }
  getStatsEntreprisesParSecteur(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats-par-secteur`);
  }
  getStatistics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statistics`);
  }
}
