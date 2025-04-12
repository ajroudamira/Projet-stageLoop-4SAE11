import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../services/entreprise.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Entreprise } from '../../entreprise/entreprise.module';
import { Stage } from '../../stage/stage.module';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-entreprise-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './entreprise-details.component.html',
  styleUrls: ['./entreprise-details.component.css']
})
export class EntrepriseDetailsComponent implements OnInit {
  entreprise: Entreprise | null = null;
  stages: Stage[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private entrepriseService: EntrepriseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEntrepriseDetails(+id);
      this.loadStagesForEntreprise(+id);
    } else {
      this.errorMessage = "ID d'entreprise non fourni";
      this.isLoading = false;
    }
  }

  private loadEntrepriseDetails(id: number): void {
    this.entrepriseService.getEntrepriseById(id).subscribe({
      next: (data) => {
        this.entreprise = data;
      },
      error: (error) => {
        console.error('Error loading entreprise details:', error);
        this.errorMessage = "Erreur lors du chargement des détails de l'entreprise";
        this.isLoading = false;
      }
    });
  }

  private loadStagesForEntreprise(id: number): void {
    this.entrepriseService.getEntrepriseStages(id).subscribe({
      next: (data) => {
        this.stages = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stages:', error);
        this.errorMessage = "Erreur lors du chargement des stages";
        this.isLoading = false;
      }
    });
  }
}