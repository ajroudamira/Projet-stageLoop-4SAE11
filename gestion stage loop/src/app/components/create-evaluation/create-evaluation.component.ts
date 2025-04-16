import { Component } from '@angular/core';
import { Evaluation } from '../../models/evaluation';
import EvaluationService from '../../services/evaluationApi';

@Component({
  selector: 'app-create-evaluation',
  templateUrl: './create-evaluation.component.html',
  styleUrls: ['./create-evaluation.component.css']
})
export class CreateEvaluationComponent {
  evaluation: Evaluation = new Evaluation();
  showEmailField: boolean = false;
  email: string = '';

  constructor() {}

  createEvaluation() {
    console.log(this.evaluation);
    EvaluationService.createEvaluation(this.evaluation)
      .then(response => {
        console.log('Évaluation créée avec succès', response.data);
        this.evaluation = new Evaluation(); // Réinitialiser le formulaire
        this.showEmailField = true; // Afficher le champ email
      })
      .catch(error => {
        console.error('Erreur lors de la création de l’évaluation', error);
      });
  }

  sendEmail() {
    // Remplace cette logique par ton service d'envoi d'email
    console.log(`Email envoyé à ${this.email} avec succès !`);
    alert(`Email envoyé à ${this.email} avec succès !`);
  }
}
