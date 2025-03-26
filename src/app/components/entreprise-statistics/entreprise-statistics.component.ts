import { Component } from '@angular/core';
import { EntrepriseService } from '../../services/entreprise.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-entreprise-statistics',
  standalone: true,
  imports: [],
  templateUrl: './entreprise-statistics.component.html',
  styleUrl: './entreprise-statistics.component.css'
})
export class EntrepriseStatisticsComponent {
  chart: any;

  ngOnInit(): void {
    this.chart = new Chart('canvas', {
      type: 'pie',
      data: {
        labels: ['Secteur 1', 'Secteur 2', 'Secteur 3'],
        datasets: [
          {
            label: 'Entreprises',
            data: [300, 450, 600],
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
          },
        ],
      },
    });
  }
}
