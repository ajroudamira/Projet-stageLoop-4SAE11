import { Component, OnInit, ViewChild } from '@angular/core';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { Chart, ChartConfiguration, ChartEvent, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styles: [`
    /* Card styling */
    .card {
      transition: all 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
    }

    /* Border styles for cards */
    .border-left-primary {
      border-left: 0.25rem solid #4e73df !important;
    }
    .border-left-success {
      border-left: 0.25rem solid #1cc88a !important;
    }
    .border-left-warning {
      border-left: 0.25rem solid #f6c23e !important;
    }
    .border-left-info {
      border-left: 0.25rem solid #36b9cc !important;
    }
    .border-left-danger {
      border-left: 0.25rem solid #e74a3b !important;
    }

    /* Text utilities */
    .text-xs {
      font-size: 0.7rem;
    }
    .text-gray-300 {
      color: #dddfeb !important;
    }
    .text-gray-800 {
      color: #5a5c69 !important;
    }

    /* Progress bar customization */
    .progress {
      height: 0.5rem;
      border-radius: 0.25rem;
    }

    /* Dashboard card spacing */
    .display-4 {
      font-size: 2.5rem !important;
    }
  `]
})
export class DashboardOverviewComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  ticketAnalytics: any = {};
  ticketsByStatus: any = {};
  ticketsByPriority: any = {};
  userCount = 0;
  isLoading = true;
  error = '';

  // Response time metrics
  avgResponseTime = 0;
  avgResolutionTime = 0;

  constructor(
    private ticketService: TicketService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Set default empty data structures
    this.ticketAnalytics = {};
    this.ticketsByStatus = {};
    this.ticketsByPriority = {};

    // Use a counter to track when all requests are complete
    let completedRequests = 0;
    const totalRequests = 5; // Analytics, Status, Priority, Users, Response Times
    
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

    // Load user count
    this.userService.getAllUsers().subscribe({
      next: response => {
        if (response.success) {
          this.userCount = response.data ? response.data.length : 0;
        } else {
          console.warn('User count response not successful:', response.message);
        }
        markRequestComplete();
      },
      error: error => {
        console.error('Error loading users:', error);
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

  calculateResponseTimeMetrics(): void {
    // In a real application, you would fetch this data from the backend
    // For demonstration purposes, we'll set mock values
    this.avgResponseTime = Math.floor(Math.random() * 24) + 1; // Random hours between 1-24
    this.avgResolutionTime = Math.floor(Math.random() * 48) + 24; // Random hours between 24-72
  }
} 