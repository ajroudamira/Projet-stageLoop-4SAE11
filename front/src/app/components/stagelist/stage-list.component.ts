import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StageService } from '../../services/stage.service';
import { LayoutStaticComponent } from '../../back-office/layout-static/layout-static.component';
import { NavbarComponent } from '../../back-office/navbar/navbar.component';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { WebSocketService } from '../../services/websocket.service';
import { StompService } from '@stomp/ng2-stompjs';
import { Subscription } from 'rxjs';
import { Stage } from '../../stage/stage.module';


@Component({
  selector: 'app-stage-list',
  standalone: true,
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.css'],
  imports: [LayoutStaticComponent, NavbarComponent, CommonModule, RouterLink],
  providers: [WebSocketService], // Explicitly provide StompService and WebSocketService
})


export class StageListComponent implements OnInit {
  listStages: any[] = [];
  chart: Chart<"pie", number[], string> | null = null; // Correction du typage
  notifications: Stage[] = [];
  private notificationsSubscription: Subscription | undefined;

  constructor(private stageService: StageService, private router: Router, private webSocketService: WebSocketService) { }

  ngOnInit(): void {
    this.loadStages();
    this.subscribeToNotifications(); // Call the subscription method here
  }

  private subscribeToNotifications(): void {
    this.notificationsSubscription = this.webSocketService.listenForNotifications().subscribe({
      next: (stages: Stage[]) => {
        this.notifications = [];
        // Use a Set to remove duplicates
        const uniqueStages = Array.from(new Set(stages));
        console.log('Received stage notifications:', uniqueStages);
        uniqueStages.forEach((stage, index) => {
          setTimeout(() => {
            this.notifications.push(stage); // Add the stage to the array
            this.removeNotificationAfterDelay(stage); // Remove the banner after 5 seconds
          }, 1000 * index); // Delay increases for each banner (1 second apart)
        });
      
      },
      error: (err) => {
        console.error('Error receiving stage notifications:', err);
      },
    });
  }
  private removeNotificationAfterDelay(stage: Stage): void {
    setTimeout(() => {
      // Find the banner element
      const bannerElement = document.querySelector(`.notification-banner[data-id="${stage.idStage}"]`);
      if (bannerElement) {
        // Add fade-out class
        bannerElement.classList.add('fade-out');
  
        // Remove the banner from the array after the transition ends
        setTimeout(() => {
          this.notifications = this.notifications.filter((s) => s.idStage !== stage.idStage);
        }, 500); // Match the transition duration
      }
    }, 5000); // Remove after 5 seconds
  }
 
  loadStages(): void {
    this.stageService.getAllStages().subscribe(
      (res) => {
        this.listStages = res.map(stage => ({
          ...stage,
          periode: this.calculatePeriode(
            this.convertToDateString(stage.dateDebut), // Convert date to string
            this.convertToDateString(stage.dateFin)    // Convert date to string
          )
        }));
        console.log('Liste des stages:', this.listStages);
        this.generateChart();
      },
      (error) => {
        console.error('Erreur de récupération des stages:', error);
      }
    );
  }
  // Convert Date object or string to proper string format (YYYY-MM-DD)
  convertToDateString(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD format
    }
    return date.toString(); // If it's already a string, return it as is
  }
  // ✅ Function to calculate period in months
  calculatePeriode(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) return 'Période inconnue';

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) return 'Dates invalides';

    const diffMonths = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());

    return diffMonths < 1 ? '1 mois' : `${diffMonths} mois`;
  }
  // loadStages(): void {
  //   this.stageService.getAllStages().subscribe(
  //     (res) => {
  //       this.listStages = res;
  //       console.log('Liste des stages:', this.listStages);
  //       this.generateChart();
  //     },
  //     (error) => {
  //       console.error('Erreur de récupération des stages:', error);
  //     }
  //   );
  // }

  generateChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const stageTypes: { [key: string]: number } = {};
    this.listStages.forEach(stage => {
      stageTypes[stage.typeStage] = (stageTypes[stage.typeStage] || 0) + 1;
    });

    const labels: string[] = Object.keys(stageTypes);
    const data: number[] = Object.values(stageTypes);
    const total = data.reduce((acc, val) => acc + val, 0); // Total des stages

    const ctx = document.getElementById('stageChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartConfig: ChartConfiguration<"pie", number[], string> = {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Nombre de stages par type',
            data: data,
            backgroundColor: ['#FFA500', '#008000', '#800080', '#FFD700', '#708090'], // Orange, Vert, Violet, Or, Gris
            hoverOffset: 4,
          },
        ],
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

  deleteStage(id: number) {
    this.stageService.deleteStage(id).subscribe(
      () => {
        console.log('Stage supprimé');
        this.loadStages();
      },
      (error) => {
        console.error('Erreur lors de la suppression du stage :', error);
      }
    );
  }

  editStage(id: number) {
    this.router.navigate([`/back-office/stages/update/${id}`]);
  }

  viewStageDetails(stageId: number) {
    this.router.navigate(['/stage', stageId]);
  }

  ngOnDestroy(): void {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe(); // Clean up the subscription
    }
  }
}
