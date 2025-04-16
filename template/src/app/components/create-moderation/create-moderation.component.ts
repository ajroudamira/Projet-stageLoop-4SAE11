import { Component } from '@angular/core';
import { Moderation } from '../../models/moderation';
import { ModerationService } from '../../services/moderationApi';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule],
  selector: 'app-create-moderation',
  templateUrl: './create-moderation.component.html',
  styleUrls: ['./create-moderation.component.css']
})
export class CreateModerationComponent {
  moderation: Moderation = new Moderation();
  errorMessage: string | null = null; // Pour stocker les messages d'erreur

  constructor(private moderationService: ModerationService) {}

  createModeration() {
    this.errorMessage = null; // Réinitialiser le message d'erreur à chaque soumission
    console.log(this.moderation);

    this.moderationService.createModeration(this.moderation)
      .then(response => {
        console.log('Modération créée avec succès', response.data);
        this.moderation = new Moderation(); // Réinitialiser le formulaire
      })
      .catch(error => {
        console.error('Erreur lors de la création de la modération', error);
        this.errorMessage = 'Erreur lors de la création de la modération. Veuillez réessayer.'; // Afficher un message d'erreur
      });
  }
  
}
