import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../services/entreprise.service';
import { Qcm } from '../../qcm/qcm.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-entreprise-qcm',
  standalone: true,
  templateUrl: './entreprise-qcm.component.html',
  styleUrl: './entreprise-qcm.component.css',
  imports: [
    FormsModule,
    CommonModule,
    LayoutStaticComponent,
    NavbarComponent,
    RouterModule,
  ],
})
export class EntrepriseQcmComponent implements OnInit {
  qcms: Qcm[] = [];
  currentStep = 0;
  answers: string[] = [];
  score: number | null = null;
  stageId: number | undefined;
  studentId: number | undefined;
  showSuccessPopup = false;
  showFailMessage = false;

  constructor(
    private entrepriseService: EntrepriseService,
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const competences = this.route.snapshot.queryParamMap.get('competences');
    if (competences) {
      this.entrepriseService
        .getQcmByCompetences(competences)
        .subscribe((data) => {
          this.qcms = data;
        });
    }
    const stageId = this.route.snapshot.queryParamMap.get('stageId'); // Retrieve the stageId from query params
    // Ensure the stageId is properly retrieved
    this.stageId = stageId ? parseInt(stageId, 10) : 0;

    // Retrieve the student ID from localStorage
    const student = JSON.parse(localStorage.getItem('etudiant') || '{}');
    this.studentId = student.id;
  }

  selectAnswer(answer: string) {
    this.answers[this.currentStep] = answer;
  }

  nextStep() {
    if (this.currentStep < this.qcms.length - 1) {
      this.currentStep++;
    } else {
      this.calculateScore();
    }
  }

  calculateScore() {
    let correct = 0;
    this.qcms.forEach((qcm, index) => {
      if (qcm.bonneReponse === this.answers[index]) {
        correct++;
      }
    });
    this.score = correct;

    if (this.score === this.qcms.length) {
      // All answers are correct, proceed with the stage application
      this.submitStageApplication();
    } else {
      // Show a message indicating that the answers were not all correct
      // this.showErrorMessage();
      this.showFailMessage = true;
      setTimeout(() => {
        this.router.navigate(['/entreprises']);
      }, 4000);
    }
  }

   // Submit the stage application to the backend
   submitStageApplication() {
    const url = `http://localhost:8089/louay/api/entreprises/stages/${this.stageId}/assign-etudiant`;
    const body = { idEtudiant: this.studentId };

    this.http.post(url, body).subscribe({
      next: (response) => {
        this.showSuccessPopup = true;

        setTimeout(() => {
          this.router.navigate(['/entreprises']);
        }, 8000);
      },
      error: (error) => {
        console.error('Error applying to stage', error);
      }
    });
  }

  
  // Display an error message if not all answers are correct
  showErrorMessage() {
    alert('Désolé, vous n\'avez pas rempli les conditions requises.');
  }
  restart() {
    this.currentStep = 0;
    this.answers = [];
    this.score = null;
    this.showFailMessage = false;
  }
}
