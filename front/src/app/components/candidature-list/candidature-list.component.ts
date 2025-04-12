import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import { CandidatureService } from '../../services/candidature.service';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-candidature-list',
  standalone: true,
  templateUrl: './candidature-list.component.html',
  styleUrls: ['./candidature-list.component.css'],
  imports: [LayoutStaticComponent, NavbarComponent, CommonModule, FormsModule]
})
export class CandidatureListComponent implements AfterViewInit {
  @ViewChild('candidatureChart') candidatureChart!: ElementRef;
  chart: any;
  listCandidature: any[] = [];
  keyword: string = '';
  loading: boolean = false;

  constructor(private candidatureService: CandidatureService, private router: Router) {}

  ngOnInit() {
    // Appel initial pour récupérer les candidatures
    this.getCandidatures();
  }

  ngAfterViewInit() {
    this.generateChart(); // Générer le graphique une fois que la vue est prête
  }

  getCandidatures() {
    this.loading = true;
    this.candidatureService.getAllCandidatures().pipe(
      catchError((error) => {
        console.error('Erreur lors du chargement des candidatures:', error);
        this.loading = false;
        return throwError(() => new Error('Erreur de récupération des candidatures'));
      })
    ).subscribe(
      (data) => {
        this.listCandidature = data;
        this.loading = false;
        this.generateChart(); // Générer le graphique après chargement des données
      }
    );
  }

  generateChart() {
    if (!this.listCandidature.length) return; // Éviter un graphique vide

    if (!this.candidatureChart || !this.candidatureChart.nativeElement) {
      setTimeout(() => this.generateChart(), 500); // Attendre un peu et réessayer
      return;
    }

    if (this.chart) {
      this.chart.destroy(); // Supprimer l'ancien graphique s'il existe
    }

    const candidatureStatuts: { [key: string]: number } = {};
    this.listCandidature.forEach(candidature => {
      candidatureStatuts[candidature.statut] = (candidatureStatuts[candidature.statut] || 0) + 1;
    });

    const labels = Object.keys(candidatureStatuts);
    const data = Object.values(candidatureStatuts);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d']; // Couleurs pour les statuts

    const ctx = this.candidatureChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de candidatures par statut',
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#fff',
            formatter: (value: number, context: any) => {
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1) + '%';
              return percentage; 
            }
          }
        }
      },
      plugins: [ChartDataLabels] // Ajouter le plugin
    });
  }

  searchCandidatures() {
    if (!this.keyword) {
      this.getCandidatures(); // Rafraîchir les candidatures si aucun mot-clé
    } else {
      this.listCandidature = this.listCandidature.filter(candidature =>
        candidature.etudiant.nom.toLowerCase().includes(this.keyword.toLowerCase()) ||
        candidature.statut.toLowerCase().includes(this.keyword.toLowerCase()) ||
        candidature.dateCandidature.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
  }

  viewCv(id: number, cvUrl: string) {
    window.open(`${environment.apiBaseUrl}/api/candidatures/cv/${cvUrl}`, '_blank');
  }

  deleteCandidature(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette candidature ?')) {
      this.candidatureService.deleteCandidature(id).pipe(
        catchError((error) => {
          console.error('Erreur lors de la suppression de la candidature :', error);
          return throwError(() => new Error('Erreur lors de la suppression de la candidature'));
        })
      ).subscribe(
        () => {
          console.log('Candidature supprimée');
          this.getCandidatures(); // Rafraîchir la liste des candidatures
          this.generateChart(); // Mettre à jour le graphique
        }
      );
    }
  }

  editCandidature(id: number): void {
    this.router.navigate([`/back-office/editcandidature/${id}`]);
  }

  supprimerCandidaturesAnciennes(): void {
    this.candidatureService.supprimerAnciennes().pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression des candidatures anciennes', error);
        return throwError(() => new Error('Une erreur est survenue lors de la suppression des candidatures anciennes.'));
      })
    ).subscribe(
      (response: any) => { // On attend maintenant un objet JSON
        console.log('Candidatures supprimées avec succès:', response.message);
      },
      (error) => {
        console.log('Erreur lors de la suppression des candidatures :', error);
      }
    );
  }

  verifierCandidaturesExpirees(): void {
    this.candidatureService.verifierExpirees().pipe(
      catchError((error) => {
        console.error('Erreur lors de la vérification des candidatures expirées', error);
        return throwError(() => new Error('Une erreur est survenue lors de la vérification des candidatures expirées.'));
      })
    ).subscribe(
      (response: any) => {
        console.log('Candidatures expirées vérifiées avec succès:', response.message);
        // Vous pouvez ajouter un message à afficher à l'utilisateur ici
      },
      (error) => {
        console.log('Erreur lors de la vérification des candidatures expirées :', error);
      }
    );
  }
}
