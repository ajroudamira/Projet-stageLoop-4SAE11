import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EntrepriseService } from '../../services/entreprise.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Entreprise } from '../../entreprise/entreprise.module';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';

@Component({
  selector: 'app-entreprise-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NavbarComponent,LayoutStaticComponent],
  templateUrl: './entreprise-add.component.html',
  styleUrls: ['./entreprise-add.component.css'],
})
export class EntrepriseAddComponent implements OnInit {
  entrepriseForm: FormGroup;
  entrepriseId: number | null = null;
  isEditMode: boolean = false; // ✅ Ajout du mode édition

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.entrepriseForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      adresse: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9À-ÿ\\s,.-]+$')]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      secteurActivite: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID de l'entreprise depuis l'URL
    const idParam = this.route.snapshot.paramMap.get('id');
    this.entrepriseId = idParam ? +idParam : null;

    if (this.entrepriseId) {
      this.isEditMode = true; // ✅ Mode édition activé si un ID est présent
      this.entrepriseService.getEntrepriseById(this.entrepriseId).subscribe(
        (entreprise: Entreprise) => {
          this.entrepriseForm.patchValue(entreprise);
        },
        (error) => {
          console.error('Erreur lors du chargement de l\'entreprise :', error);
        }
      );
    }
  }

  onSubmit(): void {
    if (this.entrepriseForm.valid) {
      const entrepriseData = this.entrepriseForm.value;

      if (this.isEditMode && this.entrepriseId) {
        // ✅ Mode édition : Mettre à jour l'entreprise
        this.entrepriseService.updateEntreprise(this.entrepriseId, entrepriseData).subscribe(
          () => {
            alert('Entreprise mise à jour avec succès !');
            this.router.navigate(['/back-office/entreprises']);
          },
          (error) => {
            console.error('Erreur lors de la mise à jour de l\'entreprise :', error);
            alert('Erreur lors de la mise à jour de l\'entreprise.');
          }
        );
      } else {
        // ✅ Mode ajout : Ajouter une nouvelle entreprise
        this.entrepriseService.addEntreprise(entrepriseData).subscribe(
          () => {
            alert('Entreprise ajoutée avec succès !');
            this.router.navigate(['/back-office/entreprises']);
          },
          (error) => {
            console.error('Erreur lors de l\'ajout de l\'entreprise :', error);
            alert('Erreur lors de l\'ajout de l\'entreprise.');
          }
        );
      }
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }

  get formControls() {
    return this.entrepriseForm.controls;
  }
}
