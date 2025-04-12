import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent implements OnInit {
  @Input() etudiants: any[] = []; // Liste des étudiants reçue

  totalEtudiants: number = 0;
  nbCompetences: number = 0;
  emailsUniques: number = 0;

  ngOnInit() {
    this.calculerStatistiques();
  }

  ngOnChanges() {
    this.calculerStatistiques();
  }

  calculerStatistiques() {
    this.totalEtudiants = this.etudiants.length;

    // Nombre total de compétences (en comptant chaque compétence séparément)
    this.nbCompetences = this.etudiants.reduce((acc, etudiant) => {
      return acc + (etudiant.competences ? etudiant.competences.split(',').length : 0);
    }, 0);

    // Nombre d'emails uniques
    const emails = new Set(this.etudiants.map(e => e.email));
    this.emailsUniques = emails.size;
  }
}
