import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormationService } from 'src/app/services/formation.service';
import { Formation } from 'src/app/models/formation';
import { FormationFormComponent } from '../formation-form/formation-form.component';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.css']
})
export class FormationListComponent implements OnInit {
  displayedColumns: string[] = ['idFormation', 'dateDebut', 'dateFin', 'description', 'formateur', 'titre', 'actions'];
  formations: Formation[] = [];

  constructor(
    private formationService: FormationService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFormations();  // Charge les formations au démarrage
  }

  loadFormations() {
    this.formationService.getFormations().subscribe(data => {
      this.formations = data;
    });
  }

  // Ouvrir le formulaire de création ou d'édition
  openDialog(formation?: Formation) {
    const dialogRef = this.dialog.open(FormationFormComponent, {
      width: '400px',
      data: formation ? { ...formation } : {}  // Si une formation est passée, on l'édite, sinon on en crée une nouvelle
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFormations();  // Recharge la liste après une action réussie
      }
    });
  }

  // Supprimer une formation
  deleteFormation(idFormation: number) {
    if (confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      this.formationService.deleteFormation(idFormation).subscribe(() => {
        this.snackBar.open("Formation supprimée avec succès", "OK", { duration: 3000 });
        this.loadFormations();  // Recharge la liste après suppression
      });
    }
  }
}
