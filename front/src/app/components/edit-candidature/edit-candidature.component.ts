import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { CandidatureModule } from '../../model/candidature/candidature.module';
import { StatutCandidature } from '../../enums/statut-candidature.enum';
import { Etudiant } from '../../model/etudiant/etudiant.module';
import { CandidatureService } from '../../services/candidature.service';
import { EtudiantService } from '../../services/etudiant.service';



@Component({
  selector: 'app-edit-candidature',
  standalone: true,
  imports: [FormsModule, LayoutStaticComponent, NavbarComponent, CommonModule],
  templateUrl: './edit-candidature.component.html',
  styleUrls: ['./edit-candidature.component.css']
})
export class EditCandidatureComponent implements OnInit {
  candidature: CandidatureModule = new CandidatureModule(0, new Date(), StatutCandidature.EN_ATTENTE, '', '', undefined);
  statutOptions = Object.values(StatutCandidature);
  etudiants: Etudiant[] = [];

  constructor(
    private candidatureService: CandidatureService,
    private etudiantService: EtudiantService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEtudiants();
    this.loadCandidature();
  }

  loadEtudiants(): void {
    this.etudiantService.getEtudiants().subscribe(
      (data) => {
        this.etudiants = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des étudiants:', error);
      }
    );
  }

  loadCandidature(): void {
    const id = +this.route.snapshot.paramMap.get('id')!; // Récupérer l'ID à partir de l'URL
    this.candidatureService.getCandidatureById(id).subscribe(
      (data) => {
        this.candidature = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération de la candidature:', error);
      }
    );
  }

  updateCandidature() {
    this.candidatureService.updateCandidature(this.candidature.id, this.candidature).subscribe(
      () => {
        alert('Candidature mise à jour avec succès !');
        this.router.navigate(['/back-office/candidatures']);
      },
      error => {
        console.error('Erreur lors de la mise à jour de la candidature:', error);
        alert('Erreur lors de la mise à jour de la candidature.');
      }
    );
  }
}