import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EntrepriseService } from '../../services/entreprise.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Entreprise } from '../../entreprise/entreprise.module';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';


declare var $: any;


@Component({
  selector: 'app-entreprise-front',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, RouterLinkActive, FormsModule,LayoutStaticComponent, NavbarComponent],
  templateUrl: './entreprise-front.component.html',
  styleUrl: './entreprise-front.component.css'
})
export class EntrepriseFrontComponent implements OnInit, AfterViewInit {
  entreprises: Entreprise[] = [];
  searchText: string = '';
  stats: { [key: string]: number } = {}; // Stocker les statistiques par secteur
  chart: Chart<"pie", number[], string> | null = null;

  constructor(private entrepriseService: EntrepriseService, private router: Router) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeDataTable(), 500);
  }

  private loadEntreprises(): void {
    this.entrepriseService.getEntreprises().subscribe({
      next: (data) => {
        this.entreprises = data;
        this.calculateStats();
        this.generateChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    });
  }

  private calculateStats(): void {
    this.stats = {};
    this.entreprises.forEach(entreprise => {
      let secteur = entreprise.secteurActivite;
      this.stats[secteur] = (this.stats[secteur] || 0) + 1;
    });
  }

  private generateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels: string[] = Object.keys(this.stats);
    const data: number[] = Object.values(this.stats);
    const total = data.reduce((acc, val) => acc + val, 0); // Total des entreprises

    const ctx = document.getElementById('entrepriseChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartConfig: ChartConfiguration<"pie", number[], string> = {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre d’entreprises par secteur',
          data: data,
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FF9F33'],
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                let dataset = tooltipItem.dataset.data;
                let value = dataset[tooltipItem.dataIndex];
                let percentage = ((value / total) * 100).toFixed(1) + "%";
                return `${tooltipItem.label}: ${value} (${percentage})`;
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold'
            },
            formatter: (value, context) => {
              let percentage = ((value / total) * 100).toFixed(1) + "%";
              return percentage;
            }
          }
        }
      },
      plugins: [ChartDataLabels] // Activation du plugin pour afficher les pourcentages
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  private initializeDataTable(): void {
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable("#datatablesSimple")) {
        $('#datatablesSimple').DataTable().destroy();
      }
      $('#datatablesSimple').DataTable();
    });
  }

  deleteEntreprise(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer cette entreprise ?")) {
      this.entrepriseService.deleteEntreprise(id).subscribe({
        next: () => {
          alert('Entreprise supprimée avec succès !');
          this.loadEntreprises();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'entreprise :', error);
        }
      });
    }
  }

  editEntreprise(id: number): void {
    this.router.navigate(['/back-office/entreprises/update/', id]);
  }

  filteredEntreprises(): Entreprise[] {
    return this.entreprises.filter(entreprise =>
      entreprise.nom.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
