import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StageService } from '../../services/stage.service';
import { EntrepriseService } from '../../services/entreprise.service';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { Stage } from '../../stage/stage.module';
import { Entreprise } from '../../entreprise/entreprise.module';
import { TypeStage } from '../../enums/TypeStage.enum';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-stage-add',
  standalone: true,
  imports: [FormsModule, CommonModule, LayoutStaticComponent, NavbarComponent],
  templateUrl: './stage-add.component.html',
  styleUrls: ['./stage-add.component.css']
})
export class StageAddComponent implements OnInit {

  stage: Stage = new Stage(0, '', '', new Date(),new Date(), '', TypeStage.PFE);

  // stage: Stage = new Stage(0, '', '', '', '', TypeStage.PFE);
  entreprises: Entreprise[] = [];
  typeStages: TypeStage[] = Object.values(TypeStage);
  submissionAttempted: boolean = false;
  isEditMode: boolean = false;
  stageId: number | null = null;
  emailDestinataire: string = ''; // Email du destinataire

  constructor(
    private stageService: StageService,
    private entrepriseService: EntrepriseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadEntreprises();
    this.checkEditMode();
  }

  // Vérifier si on est en mode édition et charger le stage si nécessaire
  checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.stageId = +id;
        this.loadStage(this.stageId);
      }
    });
  }

  // Charger les données du stage en mode édition
  loadStage(id: number): void {
    this.stageService.getStageById(id).subscribe(
      (data) => {
        this.stage = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération du stage:', error);
      }
    );
  }

  // Charger la liste des entreprises
  loadEntreprises(): void {
    this.entrepriseService.getEntreprises().subscribe(
      (data) => {
        this.entreprises = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des entreprises:', error);
      }
    );
  }

  // Soumettre le stage (ajout ou modification selon le mode)
  submitStage(): void {
    this.submissionAttempted = true;

    if (!this.validateForm()) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    if (this.isEditMode && this.stageId) {
      this.updateStage();
    } else {
      this.addStage();
    }
  }

  // Ajouter un stage
  addStage(): void {
    this.stageService.ajouterStage(this.stage).subscribe(
      (response) => {
        alert('Stage ajouté avec succès !');
        this.sendEmail(response); // Appel à l'envoi de l'email après ajout du stage
        this.router.navigate(['/back-office/stages']);
      },
      (error) => {
        console.error('Erreur lors de l’ajout du stage:', error);
        alert('Erreur lors de l’ajout du stage.');
      }
    );
  }

  // Modifier un stage
  updateStage(): void {
    this.stageService.updateStage(this.stageId!, this.stage).subscribe(
      () => {
        alert('Stage modifié avec succès !');
        this.router.navigate(['/back-office/stages']);
      },
      (error) => {
        console.error('Erreur lors de la modification du stage:', error);
        alert('Erreur lors de la modification du stage.');
      }
    );
  }

  // Valider le formulaire
  validateForm(): boolean {
    const titreValid = this.stage.titre.trim().length >= 3;
    const descriptionValid = this.stage.description.trim().length >= 10;
    const competencesValid = this.stage.competencesRequises.trim().length >= 5;
    // const periodeValid = /^\d{2}-\d{2}-\d{4}$/.test(this.stage.periode); // Format DD-MM-YYYY
    const typeValid = this.stage.typeStage !== undefined;
    const entrepriseValid = this.stage.entreprise !== undefined;
    const datesValid = this.stage.dateDebut && this.stage.dateFin && this.stage.dateDebut <= this.stage.dateFin;

    return titreValid && descriptionValid && competencesValid && typeValid && entrepriseValid;
  }

  // Envoi de l'email après l'ajout du stage
  sendEmail(stageData: any): void {
    const formData = {
      name: stageData.titre,
      description: stageData.description,
      location: stageData.entreprise?.nom,  // Si tu as une entreprise associée
      email: this.emailDestinataire,   // Utilisation de la variable emailDestinataire
    };

    console.log("Envoi de l'email avec les données suivantes:", formData); // Log pour vérifier les données

    emailjs.send('service_9siwj9w', 'template_do4xse7', formData, 'Hav_WXO1ne2WiosiL')
      .then((result) => {
        console.log('Email envoyé avec succès', result.text);
      }, (error) => {
        console.log('Erreur lors de l\'envoi de l\'email', error.text);
      });
  }
}
