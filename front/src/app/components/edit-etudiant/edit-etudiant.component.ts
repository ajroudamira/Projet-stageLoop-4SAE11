import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EtudiantService } from '../../services/etudiant.service';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';

@Component({
  selector: 'app-edit-etudiant',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, LayoutStaticComponent],
  templateUrl: './edit-etudiant.component.html',
  styleUrl: './edit-etudiant.component.css',
})
export class EditEtudiantComponent implements OnInit {
  etudiantId!: number;
  etudiant: any = { nom: '', prenom: '', email: '', telephone: '', adresse: '', competences: '' };
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private rs: EtudiantService, private router: Router) {}

  ngOnInit() {
    this.etudiantId = Number(this.route.snapshot.paramMap.get('id')); // ✅ Correction ici
    this.isLoading = true;

    this.rs.getEtudiantById(this.etudiantId).subscribe(
      (res) => {
        this.etudiant = res; 
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération de l’étudiant:', error);
        this.isLoading = false;
      }
    );
  }

  updateEtudiant() {
    this.isLoading = true;
    this.rs.updateEtudiant(this.etudiantId, this.etudiant).subscribe({ // ✅ Correction ici
      next: (res: any) => {
        console.log(res);
        alert('Étudiant mis à jour avec succès !');
        this.isLoading = false;
        this.router.navigate(['/back-office/etudiants']); 
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour de l’étudiant:', error);
        alert('Erreur lors de la mise à jour de l’étudiant.');
        this.isLoading = false;
      },
    });
  }
}