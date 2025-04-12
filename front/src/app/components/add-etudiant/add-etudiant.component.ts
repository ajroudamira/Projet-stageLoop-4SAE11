import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EtudiantService } from '../../services/etudiant.service';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-etudiant',
  standalone: true,
  imports: [FormsModule,LayoutStaticComponent,NavbarComponent,CommonModule], // Ajout de FormsModule pour gérer ngModel
  templateUrl: './add-etudiant.component.html',
  styleUrls: ['./add-etudiant.component.css'] 
})
export class AddEtudiantComponent {
  etudiant: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    competences: ''
  };
etudiantId: any;

  constructor(private rs: EtudiantService, private router: Router) {}

  addRessource() {
    if (this.etudiant.nom && this.etudiant.prenom && this.etudiant.email &&
        this.etudiant.telephone && this.etudiant.adresse && this.etudiant.competences) {
  
      this.rs.createEtudiant(this.etudiant).subscribe(
        () => {
          alert('Étudiant ajouté avec succès !');
          this.router.navigate(['/back-office/etudiants']); // Assurez-vous que cette route existe
        },
        error => {
          console.error('Erreur lors de l’ajout de l’étudiant:', error);
          alert('Erreur lors de l’ajout de l’étudiant.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }
  
  
}