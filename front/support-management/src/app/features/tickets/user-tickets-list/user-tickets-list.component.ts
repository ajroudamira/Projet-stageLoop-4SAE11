import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-tickets-list',
  templateUrl: './user-tickets-list.component.html',
  styleUrls: ['./user-tickets-list.component.scss']
})
export class UserTicketsListComponent implements OnInit {
  currentUser: User | null = null;
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filtering and sorting
  statusFilter: string = '';
  searchQuery: string = '';
  sortField: string = 'createdAt';
  sortDirection: string = 'DESC';

  constructor(
    private ticketService: TicketService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTickets();
      }
    });
  }

  loadTickets(): void {
    this.loading = true;
    if (!this.currentUser?.login) {
      this.error = 'User information not available';
      this.loading = false;
      return;
    }

    this.ticketService.getTicketsByUser(
      this.currentUser.login,
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection
    ).subscribe(
      response => {
        if (response.success && response.data) {
          this.tickets = response.data.content || [];
          this.totalItems = response.data.totalElements || 0;
          this.totalPages = response.data.totalPages || 0;
          this.applyFilters();
        } else {
          this.error = response.message || 'Failed to load tickets';
          this.tickets = [];
          this.filteredTickets = [];
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading tickets:', error);
        this.error = 'An error occurred while loading tickets';
        this.loading = false;
      }
    );
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      // Apply status filter if selected
      if (this.statusFilter && ticket.status !== this.statusFilter) {
        return false;
      }
      
      // Apply search query if entered
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return ticket.title.toLowerCase().includes(query) || 
               ticket.description.toLowerCase().includes(query) ||
               ticket.category.toLowerCase().includes(query);
      }
      
      return true;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onSortChange(field: string): void {
    if (this.sortField === field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortField = field;
      this.sortDirection = 'DESC'; // Default to descending for new sort field
    }
    this.loadTickets();
  }

  viewTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  createTicket(): void {
    this.router.navigate(['/tickets/create']);
  }

  canModifyTicket(ticket: Ticket): boolean {
    return ticket.status === TicketStatus.OPEN;
  }

  deleteTicket(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      this.ticketService.deleteTicket(id).subscribe(
        response => {
          if (response.success) {
            this.loadTickets();
          } else {
            alert('Failed to delete ticket: ' + response.message);
          }
        },
        error => {
          console.error('Error deleting ticket:', error);
          alert('An error occurred while deleting the ticket');
        }
      );
    }
  }

  editTicket(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/tickets/edit', id]);
  }
} 