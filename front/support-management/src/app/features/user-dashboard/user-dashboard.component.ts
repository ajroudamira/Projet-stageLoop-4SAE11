import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { User } from '../../core/models/user.model';
import { Ticket, TicketStatus } from '../../core/models/ticket.model';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentTickets: Ticket[] = [];
  ticketStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  };
  isLoading = true;
  error = '';

  constructor(
    private ticketService: TicketService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.login) {
        this.loadUserTickets(user.login);
      }
    });
  }

  loadUserTickets(username: string): void {
    this.isLoading = true;
    this.error = '';

    this.ticketService.getTicketsByUser(username, 0, 5).subscribe(
      response => {
        if (response.success) {
          this.recentTickets = response.data.content;
          this.calculateTicketStats(response.data.totalElements);
        }
      },
      error => {
        console.error('Error loading tickets:', error);
        this.error = 'Failed to load tickets. Please try again.';
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private calculateTicketStats(totalTickets: number): void {
    this.ticketStats.total = totalTickets;
    this.ticketStats.open = 0;
    this.ticketStats.inProgress = 0;
    this.ticketStats.resolved = 0;
    this.ticketStats.closed = 0;
    
    this.recentTickets.forEach(ticket => {
      switch (ticket.status) {
        case TicketStatus.OPEN:
          this.ticketStats.open++;
          break;
        case TicketStatus.IN_PROGRESS:
          this.ticketStats.inProgress++;
          break;
        case TicketStatus.RESOLVED:
          this.ticketStats.resolved++;
          break;
        case TicketStatus.CLOSED:
          this.ticketStats.closed++;
          break;
      }
    });
  }

  createNewTicket(): void {
    this.router.navigate(['/tickets/create']);
  }

  viewTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  refreshDashboard(): void {
    if (this.currentUser && this.currentUser.login) {
      this.loadUserTickets(this.currentUser.login);
    }
  }

  get canAccessCandidatures(): boolean {
    return this.currentUser?.role === 'student' || this.currentUser?.role === 'partner';
  }

  get candidaturesRoute(): string {
    if (this.currentUser?.role === 'student') {
      return '/student/candidatures';
    } else if (this.currentUser?.role === 'partner') {
      return '/partner/candidatures';
    }
    return '';
  }
} 