import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Evaluation } from '../../models/evaluation';
import EvaluationService from '../../services/evaluationApi';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-afficher-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './afficher-evaluation.component.html',
  styleUrls: ['./afficher-evaluation.component.css']
})
export class AfficherEvaluationComponent implements OnInit {
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  loading: boolean = false;
  searchControl = new FormControl('');  // FormControl pour la recherche
  editForms: { [key: number]: FormGroup } = {}; 

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadEvaluations();
    // Détection de changements dans le champ de recherche
    this.searchControl.valueChanges.subscribe(() => {
      this.filterEvaluations();
    });
  }

  async loadEvaluations(): Promise<void> {
    this.loading = true;
    try {
      const response = await EvaluationService.getAllEvaluations();
      this.evaluations = response.data.map((evaluation: Evaluation) => {
        this.editForms[evaluation.id] = this.fb.group({
          studentName: [evaluation.studentName, [Validators.required, Validators.minLength(3)]],
          score: [evaluation.score, [Validators.required, Validators.min(0), Validators.max(100)]],
          comments: [evaluation.comments, [Validators.maxLength(255)]]
        });
        return { ...evaluation, editMode: false };
      });
      this.filteredEvaluations = [...this.evaluations];
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations', error);
    } finally {
      this.loading = false;
    }
  }

  editEvaluation(evaluation: Evaluation): void {
    evaluation.editMode = true;
  }

  async updateEvaluation(evaluation: Evaluation): Promise<void> {
    if (this.editForms[evaluation.id].invalid) {
      console.log('Formulaire invalide');
      return;
    }

    try {
      const updatedData = this.editForms[evaluation.id].value;
      const response = await EvaluationService.updateEvaluation(evaluation.id, updatedData);
      console.log('Évaluation mise à jour avec succès', response.data);

      evaluation.studentName = updatedData.studentName;
      evaluation.score = updatedData.score;
      evaluation.comments = updatedData.comments;
      evaluation.editMode = false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l’évaluation', error);
    }
  }

  async deleteEvaluation(id: number): Promise<void> {
    if (confirm("Voulez-vous vraiment supprimer cette évaluation ?")) {
      try {
        await EvaluationService.deleteEvaluation(id);
        this.evaluations = this.evaluations.filter(evaluation => evaluation.id !== id);
        this.filteredEvaluations = this.filteredEvaluations.filter(evaluation => evaluation.id !== id);
        console.log('Évaluation supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de l’évaluation', error);
      }
    }
  }

  filterEvaluations(): void {
    const searchQuery = this.searchControl.value.toLowerCase();  // Récupération de la valeur du champ de recherche
    this.filteredEvaluations = this.evaluations.filter(evaluation =>
      evaluation.studentName.toLowerCase().includes(searchQuery) ||
      evaluation.score.toString().includes(searchQuery) ||
      evaluation.comments.toLowerCase().includes(searchQuery)
    );
  }

  isFieldInvalid(evaluationId: number, fieldName: string): boolean {
    const control = this.editForms[evaluationId]?.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }
}
