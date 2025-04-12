import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stage } from '../stage/stage.module';  // Importer le modèle Stage
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StageService {

  private apiUrl =  `${environment.apiBaseUrl}/louay/api/stages`; // URL de l'API pour les stages

  constructor(private http: HttpClient) { }

  // Récupérer tous les stages
  getAllStages(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}`);
  }

  // Récupérer un stage par son ID
  getStageById(id: number): Observable<Stage> {
    return this.http.get<Stage>(`${this.apiUrl}/afficher-un-seul-stage/${id}`);
  }

  // Ajouter un nouveau stage
  ajouterStage(stage: Stage): Observable<Stage> {
    return this.http.post<Stage>(`${this.apiUrl}/ajouter`, stage, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

   

  // Modifier un stage existant
  updateStage(id: number, stage: Stage): Observable<Stage> {
    return this.http.put<Stage>(`${this.apiUrl}/modifier/${id}`, stage);
  }

  // Supprimer un stage par son ID
  deleteStage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supprimer/${id}`);
  }

  // Rechercher un stage par titre
  searchStageByTitle(titre: string): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}/rechercher?titre=${titre}`);
  }

  // Rechercher un stage par type
  searchStageByType(typeStage: string): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}/rechercher-avec-type?typeStage=${typeStage}`);
  }
}
