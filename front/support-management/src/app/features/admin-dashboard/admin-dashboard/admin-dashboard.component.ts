import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  ticketAnalytics: any = {};
  ticketsByStatus: any = {};
  ticketsByPriority: any = {};
  ticketTrends: any = {};
  userCount = 0;
  isLoading = true;
  error = '';
  userName: string = '';
  userRole: string = '';

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private ticketService: TicketService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.initUserInfo();
  }

  async initUserInfo(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (isLoggedIn) {
        try {
          const userProfile = await this.keycloakService.loadUserProfile();
          this.userName = userProfile.firstName + ' ' + userProfile.lastName || userProfile.username || 'User';
          
          const roles = await this.keycloakService.getUserRoles();
          console.log('User roles:', roles);
          this.userRole = roles.includes('admin') ? 'Administrator' : 'User';
          
          // Only load dashboard data if user has admin role
          if (roles.includes('admin')) {
            this.loadDashboardData();
          } else {
            console.warn('User does not have admin role. Dashboard data will not be loaded.');
            this.isLoading = false;
            this.error = 'You do not have administrator privileges to view this dashboard.';
            // Redirect to user dashboard if they aren't an admin
            setTimeout(() => {
              this.router.navigate(['/user']);
            }, 2000);
          }
        } catch (profileError) {
          console.error('Failed to load user profile details:', profileError);
          this.isLoading = false;
          this.error = 'Error loading user profile. Please try refreshing the page.';
        }
      } else {
        console.warn('User is not logged in, redirecting to login page');
        this.isLoading = false;
        this.keycloakService.login({
          redirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      this.isLoading = false;
      this.error = 'Authentication error. Please refresh and try again.';
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Set default empty data structures to avoid UI errors
    this.ticketAnalytics = {};
    this.ticketsByStatus = {};
    this.ticketsByPriority = {};
    this.ticketTrends = {};

    // Use a counter to track when all requests are complete
    let completedRequests = 0;
    const totalRequests = 5; // Analytics, Status, Priority, Trends, Users
    
    const markRequestComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        this.isLoading = false;
      }
    };

    // Load ticket analytics
    this.ticketService.getTicketAnalytics().subscribe({
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

    // Load ticket trends
    this.ticketService.getTicketTrends().subscribe({
      next: response => {
        if (response.success) {
          this.ticketTrends = response.data || {};
        } else {
          console.warn('Ticket trends response not successful:', response.message);
        }
        markRequestComplete();
      },
      error: error => {
        console.error('Error loading ticket trends:', error);
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

    // Add a safety timeout to ensure loading state always completes
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Forcing loading state to complete after timeout');
        this.isLoading = false;
      }
    }, 5000);
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
} 