import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidatureService } from '../../services/candidature.service';
@Component({
  selector: 'app-cv-display',
  templateUrl: './cv-display.component.html',
  styleUrls: ['./cv-display.component.css']
})
export class CvDisplayComponent implements OnInit {
  cvUrl: string | null = null;
  errorMessage: string | null = null; // Variable pour stocker un message d'erreur

  constructor(private route: ActivatedRoute, private candidatureService: CandidatureService) {}

  ngOnInit(): void {
    const candidatureId = this.route.snapshot.paramMap.get('id');
    console.log('ID de la candidature:', candidatureId);
    this.loadCv(candidatureId ? +candidatureId : null);
  }

  loadCv(candidatureId: number | null) {
    if (candidatureId) {
      this.candidatureService.getCandidatureById(candidatureId).subscribe(
        candidature => {
          console.log('Candidature:', candidature); // Ajoutez cette ligne
          this.cvUrl = candidature.cvUrl;
          if (!this.cvUrl) {
            this.errorMessage = 'CV URL est introuvable.';
            console.error(this.errorMessage);
          }
        },
        error => {
          this.errorMessage = 'Erreur lors du chargement de la candidature.';
          console.error(this.errorMessage, error);
        }
      );
    }
  }
}
