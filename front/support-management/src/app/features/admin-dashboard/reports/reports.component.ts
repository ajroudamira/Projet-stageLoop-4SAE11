import { Component, OnInit, ViewChild } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { Chart, ChartConfiguration, ChartEvent, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  ticketsByStatus: any = {};
  ticketsByPriority: any = {};
  ticketAnalytics: any = {};
  isLoading = true;
  error = '';

  // Response time metrics
  avgFirstResponseTime = 0;
  avgResolutionTime = 0;

  // Pie chart for status distribution
  statusChartData: ChartData<'pie'> = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(78, 115, 223, 0.8)', // Primary (blue)
          'rgba(246, 194, 62, 0.8)', // Warning (yellow)
          'rgba(54, 185, 204, 0.8)', // Info (light blue)
          'rgba(28, 200, 138, 0.8)'  // Success (green)
        ],
        borderWidth: 1
      }
    ]
  };

  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  // Pie chart for priority distribution
  priorityChartData: ChartData<'pie'> = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(28, 200, 138, 0.8)',  // Success (green)
          'rgba(54, 185, 204, 0.8)',  // Info (light blue)
          'rgba(246, 194, 62, 0.8)',  // Warning (yellow)
          'rgba(231, 74, 59, 0.8)'    // Danger (red)
        ],
        borderWidth: 1
      }
    ]
  };

  priorityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  avgCustomerSatisfaction = 0;

  constructor(
    private ticketService: TicketService,
    private userService: UserService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;
    this.error = '';
    this.ticketAnalytics = {};
    this.ticketsByStatus = {};
    this.ticketsByPriority = {};
    this.reportService.loadReportData().subscribe({
      next: (data) => {
        this.ticketAnalytics = data.ticketAnalytics;
        this.ticketsByStatus = data.ticketsByStatus;
        this.ticketsByPriority = data.ticketsByPriority;
        this.avgFirstResponseTime = Math.round(data.responseTimes.avgFirstResponseTime);
        this.avgResolutionTime = Math.round(data.responseTimes.avgResolutionTime);
        this.updateStatusChart();
        this.updatePriorityChart();
        this.reportService.getAverageCustomerSatisfaction().subscribe(avg => {
          this.avgCustomerSatisfaction = avg;
          this.isLoading = false;
        });
      },
      error: (error) => {
        this.error = 'Failed to load report data.';
        this.isLoading = false;
      }
    });
  }

  updateStatusChart(): void {
    // Update status chart data
    if (this.statusChartData.datasets && this.statusChartData.datasets.length > 0) {
      this.statusChartData.datasets[0].data = [
        this.ticketsByStatus.OPEN || 0,
        this.ticketsByStatus.IN_PROGRESS || 0,
        this.ticketsByStatus.RESOLVED || 0,
        this.ticketsByStatus.CLOSED || 0
      ];
    }
  }

  updatePriorityChart(): void {
    // Update priority chart data
    if (this.priorityChartData.datasets && this.priorityChartData.datasets.length > 0) {
      this.priorityChartData.datasets[0].data = [
        this.ticketsByPriority.LOW || 0,
        this.ticketsByPriority.MEDIUM || 0,
        this.ticketsByPriority.HIGH || 0,
        this.ticketsByPriority.CRITICAL || 0
      ];
    }
  }
} 