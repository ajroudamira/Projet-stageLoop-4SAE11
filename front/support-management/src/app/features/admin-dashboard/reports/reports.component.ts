import { Component, OnInit, ViewChild } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { Chart, ChartConfiguration, ChartEvent, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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
  avgResponseTime = 0;
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

  constructor(
    private ticketService: TicketService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;
    this.error = '';

    // Set default empty data structures
    this.ticketAnalytics = {};
    this.ticketsByStatus = {};
    this.ticketsByPriority = {};

    // Use a counter to track when all requests are complete
    let completedRequests = 0;
    const totalRequests = 4; // Analytics, Status, Priority, Response Times
    
    const markRequestComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        this.isLoading = false;
      }
    };

    // Load ticket analytics
    this.ticketService.getAllTickets().subscribe({
      next: response => {
        if (response.success) {
          this.ticketAnalytics = response.data || {};
        } else {
          console.warn('Ticket analytics response not successful:', response.message);
        }
        markRequestComplete();
      },
      error: error => {
        console.error('Error loading ticket analytics:', error);
        this.error = 'Failed to load ticket analytics.';
        markRequestComplete();
      }
    });

    // Load tickets by status
    this.ticketService.getTicketsByStatusForAdmin().subscribe({
      next: response => {
        if (response.success) {
          this.ticketsByStatus = response.data || {};
          this.updateStatusChart();
        } else {
          console.warn('Tickets by status response not successful:', response.message);
        }
        markRequestComplete();
      },
      error: error => {
        console.error('Error loading tickets by status:', error);
        markRequestComplete();
      }
    });

    // Load tickets by priority
    this.ticketService.getTicketsByPriorityForAdmin().subscribe({
      next: response => {
        if (response.success) {
          this.ticketsByPriority = response.data || {};
          this.updatePriorityChart();
        } else {
          console.warn('Tickets by priority response not successful:', response.message);
        }
        markRequestComplete();
      },
      error: error => {
        console.error('Error loading tickets by priority:', error);
        markRequestComplete();
      }
    });

    // Load response time metrics
    this.calculateResponseTimeMetrics();
    markRequestComplete();

    // Add a safety timeout to ensure loading state always completes
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Forcing loading state to complete after timeout');
        this.isLoading = false;
      }
    }, 5000);
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

  calculateResponseTimeMetrics(): void {
    this.ticketService.getResponseTimeMetrics().subscribe({
      next: (response: { success: boolean; message?: string; data?: { avgResponseTime: number; avgResolutionTime: number } }) => {
        if (response.success && response.data) {
          const metrics = response.data;
          this.avgResponseTime = Math.round(metrics.avgResponseTime);
          this.avgResolutionTime = Math.round(metrics.avgResolutionTime);
        } else {
          console.error('Failed to fetch response time metrics:', response.message);
          this.avgResponseTime = 0;
          this.avgResolutionTime = 0;
        }
      },
      error: (error: Error) => {
        console.error('Error fetching response time metrics:', error);
        this.avgResponseTime = 0;
        this.avgResolutionTime = 0;
      }
    });
  }
} 