import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidatureService } from '../../services/candidature.service';
import { CandidatureModule } from '../../model/candidature/candidature.module';
import { StatutCandidature } from '../../enums/statut-candidature.enum';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Etudiant } from '../../model/etudiant/etudiant.module';
import { EtudiantService } from '../../services/etudiant.service';

@Component({
  selector: 'app-add-candidature',
  standalone: true,
  imports: [FormsModule, LayoutStaticComponent, NavbarComponent, CommonModule],
  templateUrl: './add-candidature.component.html',
  styleUrls: ['./add-candidature.component.css']
})
export class AddCandidatureComponent implements OnInit {
  candidature: CandidatureModule =new CandidatureModule(0, new Date(), StatutCandidature.EN_ATTENTE, '', '', new Date(), undefined);

  
  statutOptions = Object.values(StatutCandidature);
  etudiants: Etudiant[] = []; // Tableau pour stocker les étudiants
  submissionAttempted: boolean = false; // Indicateur de tentative de soumission
  cvFile: File | null = null; // Propriété pour stocker le fichier CV

  constructor(
    private candidatureService: CandidatureService,
    private etudiantService: EtudiantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEtudiants();
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
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cvFile = input.files[0];
      this.candidature.cvUrl = URL.createObjectURL(this.cvFile); // Créer l'URL du fichier
    }
  }
  

  addCandidature() {
    this.submissionAttempted = true;
  
    // Convertir la chaîne de date en objet Date si nécessaire
    if (typeof this.candidature.dateCandidature === 'string') {
      this.candidature.dateCandidature = new Date(this.candidature.dateCandidature);
    }
  
    // Convertir la chaîne de dateExpiration en objet Date si nécessaire
    if (typeof this.candidature.dateExpiration === 'string') {
      this.candidature.dateExpiration = new Date(this.candidature.dateExpiration);
    }
  
    // Valider le formulaire
    if (this.validateForm()) {
      // Envoi de la candidature
      this.candidatureService.createCandidature(this.candidature).subscribe(
        () => {
          alert('Candidature ajoutée avec succès !');
          this.router.navigate(['/back-office/candidatures']);
        },
        error => {
          console.error('Erreur lors de l’ajout de la candidature:', error);
          alert('Erreur lors de l’ajout de la candidature.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }
  

  validateForm(): boolean {
    return !!(
      this.candidature.etudiant &&
      this.candidature.dateCandidature instanceof Date && !isNaN(this.candidature.dateCandidature.getTime()) &&
      this.candidature.statut &&
      this.candidature.lettreMotivation &&
      this.candidature.cvUrl && // Assurez-vous que l'URL du CV est bien définie
      (this.candidature.dateExpiration instanceof Date && !isNaN(this.candidature.dateExpiration.getTime()) || !this.candidature.dateExpiration) && // Validation de dateExpiration
      this.cvFile
    );
  }
  
  selectEtudiant(etudiant: Etudiant) {
    this.candidature.etudiant = etudiant;
  }

  goToCvPage() {
    if (this.cvFile) {
      const cvUrl = URL.createObjectURL(this.cvFile); // Crée un URL pour le fichier
      window.open(cvUrl, '_blank'); // Ouvre le CV dans un nouvel onglet
    } else {
      alert('Veuillez d\'abord télécharger un CV.');
    }
  }
}
