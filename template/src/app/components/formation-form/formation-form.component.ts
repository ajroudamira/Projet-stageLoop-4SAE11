import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormationService } from 'src/app/services/formation.service';
import { Formation } from 'src/app/models/formation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formation-form',
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.css']
})
export class FormationFormComponent {
  formationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FormationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Formation
  ) {
    // Initialisation du formulaire avec les valeurs des données passées
    this.formationForm = this.fb.group({
      idFormation: [data?.idFormation || null],
      titre: [data?.titre || '', Validators.required],
      description: [data?.description || ''],
      formateur: [data?.formateur || '', Validators.required],
      dateDebut: [data?.dateDebut || '', Validators.required],
      dateFin: [data?.dateFin || '', Validators.required],
    });
  }

  submit() {
    if (this.formationForm.valid) {
      const formation: Formation = this.formationForm.value;
      console.log('Form data:', formation);  // Déboguer les données du formulaire

      if (formation.idFormation) {
        // Mise à jour de la formation si idFormation existe
        this.formationService.updateFormation(formation.idFormation, formation).subscribe({
          next: () => {
            this.snackBar.open("Formation mise à jour avec succès", "OK", { duration: 3000 });
            this.dialogRef.close(true);  // Fermer la fenêtre du dialogue et signaler un succès
          },
          error: (err) => {
            console.error('Error updating formation:', err);
            this.snackBar.open("Erreur lors de la mise à jour", "OK", { duration: 3000 });
          }
        });
      } else {
        // Création d'une nouvelle formation si idFormation n'existe pas
        this.formationService.createFormation(formation).subscribe({
          next: () => {
            this.snackBar.open("Formation ajoutée avec succès", "OK", { duration: 3000 });
            this.dialogRef.close(true);  // Fermer la fenêtre du dialogue et signaler un succès
          },
          error: (err) => {
            console.error('Error creating formation:', err);
            this.snackBar.open("Erreur lors de l'ajout de la formation", "OK", { duration: 3000 });
          }
        });
      }
    } else {
      this.snackBar.open("Veuillez remplir tous les champs", "OK", { duration: 3000 });
    }
  }
}
