import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../../core/models/ticket.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TicketManagerService } from '../../../core/services/ticket-manager.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService, AUTH_SERVICE_TOKEN } from '../../../core/services/auth.service';

// For Bootstrap modal
declare var bootstrap: any;

@Component({
  selector: 'app-ticket-management',
  templateUrl: './ticket-management.component.html',
  styleUrls: ['./ticket-management.component.scss']
})
export class TicketManagementComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Pagination
  totalTickets = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Sorting
  sortField = 'createdAt';
  sortDirection = 'desc';
  
  // Filtering
  statusFilter = '';
  priorityFilter = '';
  searchQuery = '';
  
  // New ticket form
  ticketForm: FormGroup;
  isSubmitting = false;
  
  // Modal reference
  createTicketModal: any;
  assignTicketsModal: any;
  changeStatusModal: any;
  changePriorityModal: any;
  
  // Math reference for template
  Math = Math;
  
  // Enums for the template
  TicketStatus = TicketStatus;
  TicketPriority = TicketPriority;
  TicketCategory = TicketCategory;
  
  // Multiple ticket selection
  selectedTickets: Set<number> = new Set<number>();
  allTicketsSelected = false;
  admins: User[] = [];
  selectedAdminUsername = '';
  isAssigningBulk = false;
  
  // Bulk status change
  selectedStatus = '';
  isChangingBulkStatus = false;
  
  // Bulk priority change
  selectedPriority = '';
  isChangingBulkPriority = false;
  
  displayedColumns: string[] = ['select', 'id', 'title', 'status', 'priority', 'created', 'username', 'actions'];
  
  isTicketManager = false;

  isUnassigningBulk = false;
  unassignModal: any;

  constructor(
    private ticketService: TicketService,
    private userProfileService: UserProfileService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private ticketManagerService: TicketManagerService,
    private toastr: ToastrService,
    @Inject(AUTH_SERVICE_TOKEN) private authService: AuthService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [TicketStatus.OPEN],
      priority: [TicketPriority.MEDIUM],
      category: [TicketCategory.TECHNICAL, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTickets();
    this.loadAdmins();
    this.initModals();
    this.checkTicketManagerStatus();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.error = null;
    
    this.ticketService.getAllTickets(
      this.pageIndex, 
      this.pageSize, 
      this.sortField, 
      this.sortDirection
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            // Direct array
            this.tickets = response.data;
            this.totalTickets = response.data.length;
          } else if (response.data.content) {
            // Paginated response
            this.tickets = response.data.content;
            this.totalTickets = response.data.totalElements || 0;
          } else {
            // Empty or unexpected format
            this.tickets = [];
            this.totalTickets = 0;
          }
          this.applyFilter();
          this.clearSelection();
        } else {
          this.tickets = [];
          this.filteredTickets = [];
          this.totalTickets = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tickets. Please try again.';
        this.isLoading = false;
        console.error('Error loading tickets:', err);
      }
    });
  }

  loadAdmins(): void {
    this.userService.getAdmins().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success && response.data) {
          this.admins = response.data;
        } else {
          console.error('Failed to load admins:', response.message);
        }
      },
      error: (err: any) => {
        console.error('Error loading admins:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadTickets();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.loadTickets();
  }

  applyFilter(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchesStatus = !this.statusFilter || ticket.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || ticket.priority === this.priorityFilter;
      
      let matchesSearch = true;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        
        // Check if query matches any of these fields
        matchesSearch = 
          // Check ID (convert to string first)
          (ticket.id?.toString().includes(query) || false) ||
          // Check title
          (ticket.title?.toLowerCase().includes(query) || false) ||
          // Check description
          (ticket.description?.toLowerCase().includes(query) || false) ||
          // Check submitter name
          ((ticket.submitter?.firstName?.toLowerCase() + ' ' + ticket.submitter?.lastName?.toLowerCase())?.includes(query) || false) ||
          // Check category
          (ticket.category?.toLowerCase().includes(query) || false);
      }
      
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.searchQuery = '';
    this.filteredTickets = [...this.tickets];
  }

  hasFiltersApplied(): boolean {
    return !!(this.statusFilter || this.priorityFilter || this.searchQuery);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-primary';
      case TicketStatus.IN_PROGRESS:
        return 'bg-warning';
      case TicketStatus.RESOLVED:
        return 'bg-success';
      case TicketStatus.CLOSED:
        return 'bg-secondary';
      default:
        return 'bg-light';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case TicketPriority.LOW:
        return 'bg-success';
      case TicketPriority.MEDIUM:
        return 'bg-info';
      case TicketPriority.HIGH:
        return 'bg-warning';
      case TicketPriority.CRITICAL:
        return 'bg-danger';
      default:
        return 'bg-light';
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalTickets / this.pageSize);
    let pages: number[] = [];
    
    if (totalPages <= 5) {
      // Less than 5 pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More than 5 pages, show first, last, and pages around current
      const currentPage = this.pageIndex + 1;
      
      // Always include first and last page
      pages.push(1);
      
      // Add pages around current page
      if (currentPage > 3) {
        pages.push(0); // Indicator for ellipsis
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push(0); // Indicator for ellipsis
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }

  viewTicketDetails(ticket: Ticket): void {
    if (ticket && ticket.id) {
      this.router.navigate(['/admin/tickets', ticket.id]);
    }
  }

  confirmDeleteTicket(ticket: Ticket): void {
    if (!this.canDeleteTicket(ticket)) {
      this.toastr.warning(
        'You can only delete your own tickets that are in OPEN status',
        'Access Restricted',
        { timeOut: 5000 }
      );
      return;
    }
    if (confirm(`Are you sure you want to delete ticket #${ticket.id}: ${ticket.title}?`)) {
      this.deleteTicket(ticket);
    }
  }

  deleteTicket(ticket: Ticket): void {
    this.ticketService.deleteTicket(ticket.id!).subscribe({
      next: () => {
        this.toastr.success('Ticket deleted successfully', 'Success');
        this.loadTickets();
      },
      error: (error) => this.handleError(error, 'delete ticket')
    });
  }

  // Modal functions
  initModals(): void {
    try {
      const createTicketModalEl = document.getElementById('createTicketModal');
      if (createTicketModalEl) {
        this.createTicketModal = new bootstrap.Modal(createTicketModalEl);
      }
      
      const assignTicketsModalEl = document.getElementById('assignTicketsModal');
      if (assignTicketsModalEl) {
        this.assignTicketsModal = new bootstrap.Modal(assignTicketsModalEl);
      }
      
      const changeStatusModalEl = document.getElementById('changeStatusModal');
      if (changeStatusModalEl) {
        this.changeStatusModal = new bootstrap.Modal(changeStatusModalEl);
      }
      
      const changePriorityModalEl = document.getElementById('changePriorityModal');
      if (changePriorityModalEl) {
        this.changePriorityModal = new bootstrap.Modal(changePriorityModalEl);
      }

      this.unassignModal = new bootstrap.Modal(document.getElementById('unassignTicketsModal'));
    } catch (error) {
      console.error('Error initializing modals:', error);
    }
  }

  openCreateTicketModal(): void {
    // Reset form
    this.ticketForm.reset({
      title: '',
      description: '',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.TECHNICAL
    });
    
    if (this.createTicketModal) {
      this.createTicketModal.show();
    }
  }

  createTicket(): void {
    if (this.ticketForm.invalid) return;
    
    this.isSubmitting = true;
    
    // Get current user information from UserProfileService
    const currentUser = this.userProfileService.currentUserValue;
    
    // Create a properly typed User object for the submitter
    const submitter: User = {
      id_User: currentUser?.id_User || 0,
      login: currentUser?.login || '',
      email: currentUser?.email || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      role: currentUser?.role || ''
    };
    
    const newTicket: Ticket = {
      title: this.ticketForm.value.title,
      description: this.ticketForm.value.description,
      status: this.ticketForm.value.status,
      priority: this.ticketForm.value.priority,
      category: this.ticketForm.value.category,
      submitter: submitter
    };
    
    this.ticketService.createTicket(newTicket).pipe(
      finalize(() => {
        this.isSubmitting = false;
        if (this.createTicketModal) {
          this.createTicketModal.hide();
        }
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Add to local array and navigate to ticket
          this.tickets.unshift(response.data);
          this.applyFilter();
          
          // Navigate to the new ticket
          setTimeout(() => {
            if (response.data) {
              this.viewTicketDetails(response.data);
            }
          }, 500);
        } else {
          this.error = response.message || 'Failed to create ticket';
        }
      },
      error: (err) => {
        console.error('Error creating ticket:', err);
        this.error = 'Failed to create ticket. Please try again.';
      }
    });
  }

  // Multiple ticket selection methods
  toggleSelectTicket(ticketId: number, event: Event): void {
    event.stopPropagation(); // Prevent row click event
    
    if (this.selectedTickets.has(ticketId)) {
      this.selectedTickets.delete(ticketId);
    } else {
      this.selectedTickets.add(ticketId);
    }
    
    // Update allTicketsSelected state
    this.allTicketsSelected = this.filteredTickets.length > 0 && 
      this.selectedTickets.size === this.filteredTickets.length;
  }
  
  toggleSelectAllTickets(event: Event): void {
    event.stopPropagation();
    
    if (this.allTicketsSelected) {
      // Deselect all
      this.selectedTickets.clear();
    } else {
      // Select all filtered tickets
      this.filteredTickets.forEach(ticket => {
        if (ticket.id) {
          this.selectedTickets.add(ticket.id);
        }
      });
    }
    
    this.allTicketsSelected = !this.allTicketsSelected;
  }
  
  clearSelection(): void {
    this.selectedTickets.clear();
    this.allTicketsSelected = false;
  }
  
  hasSelectedTickets(): boolean {
    return this.selectedTickets.size > 0;
  }
  
  openAssignTicketsModal(): void {
    if (!this.checkTicketManagerAccess('assign tickets')) {
      return;
    }
    if (!this.hasSelectedTickets()) return;
    
    // Reset selection
    this.selectedAdminUsername = '';
    
    if (this.assignTicketsModal) {
      this.assignTicketsModal.show();
    }
  }
  
  bulkAssignTickets(): void {
    if (!this.checkTicketManagerAccess('perform bulk assignments')) {
      return;
    }
    if (!this.selectedAdminUsername || !this.hasSelectedTickets()) return;
    
    this.isAssigningBulk = true;
    const ticketIds = Array.from(this.selectedTickets);
    
    this.ticketService.bulkAssignTickets(ticketIds, this.selectedAdminUsername)
      .pipe(
        finalize(() => {
          this.isAssigningBulk = false;
          if (this.assignTicketsModal) {
            this.assignTicketsModal.hide();
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTickets();
            this.toastr.success(`Successfully assigned ${ticketIds.length} tickets to admin ${this.selectedAdminUsername}`, 'Success');
          } else {
            this.toastr.error(response.message || 'Failed to assign tickets', 'Error');
          }
        },
        error: (err) => {
          console.error('Error assigning tickets:', err);
          this.toastr.error('Failed to assign tickets. Please try again.', 'Error');
        }
      });
  }
  
  openUnassignTicketsModal(): void {
    if (!this.checkTicketManagerAccess('unassign tickets')) {
      return;
    }
    if (!this.hasSelectedTickets()) return;
    
    if (this.unassignModal) {
      this.unassignModal.show();
    }
  }
  
  bulkUnassignTickets(): void {
    if (!this.checkTicketManagerAccess('perform bulk unassignments')) {
      return;
    }
    if (!this.hasSelectedTickets()) return;
    
    this.isUnassigningBulk = true;
    const ticketIds = Array.from(this.selectedTickets);
    
    this.ticketService.bulkUnassignTickets(ticketIds)
      .pipe(
        finalize(() => {
          this.isUnassigningBulk = false;
          if (this.unassignModal) {
            this.unassignModal.hide();
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTickets();
            this.toastr.success(`Successfully unassigned ${ticketIds.length} tickets`, 'Success');
          } else {
            this.toastr.error(response.message || 'Failed to unassign tickets', 'Error');
          }
        },
        error: (err) => {
          console.error('Error unassigning tickets:', err);
          this.toastr.error('Failed to unassign tickets. Please try again.', 'Error');
        }
      });
  }
  
  openChangeStatusModal(): void {
    if (!this.hasSelectedTickets()) return;
    
    // Reset selection
    this.selectedStatus = '';
    
    if (this.changeStatusModal) {
      this.changeStatusModal.show();
    }
  }
  
  bulkChangeStatus(): void {
    if (!this.selectedStatus || !this.hasSelectedTickets()) return;
    
    this.isChangingBulkStatus = true;
    const ticketIds = Array.from(this.selectedTickets);
    
    this.ticketService.bulkChangeTicketStatus(ticketIds, this.selectedStatus)
      .pipe(
        finalize(() => {
          this.isChangingBulkStatus = false;
          if (this.changeStatusModal) {
            this.changeStatusModal.hide();
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTickets();
            this.toastr.success(`Successfully changed status of ${ticketIds.length} tickets to ${this.selectedStatus}`, 'Success');
          } else {
            this.toastr.error(response.message || 'Failed to change ticket status', 'Error');
          }
        },
        error: (err) => {
          console.error('Error changing ticket status:', err);
          this.toastr.error('Failed to change ticket status. Please try again.', 'Error');
        }
      });
  }
  
  openChangePriorityModal(): void {
    if (!this.hasSelectedTickets()) return;
    
    // Reset selection
    this.selectedPriority = '';
    
    if (this.changePriorityModal) {
      this.changePriorityModal.show();
    }
  }
  
  bulkChangePriority(): void {
    if (!this.selectedPriority || !this.hasSelectedTickets()) return;
    
    this.isChangingBulkPriority = true;
    const ticketIds = Array.from(this.selectedTickets);
    
    this.ticketService.bulkChangeTicketPriority(ticketIds, this.selectedPriority)
      .pipe(
        finalize(() => {
          this.isChangingBulkPriority = false;
          if (this.changePriorityModal) {
            this.changePriorityModal.hide();
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTickets();
            this.toastr.success(`Successfully changed priority of ${ticketIds.length} tickets to ${this.selectedPriority}`, 'Success');
          } else {
            this.toastr.error(response.message || 'Failed to change ticket priority', 'Error');
          }
        },
        error: (err) => {
          console.error('Error changing ticket priority:', err);
          this.toastr.error('Failed to change ticket priority. Please try again.', 'Error');
        }
      });
  }

  confirmBulkDeleteTickets(): void {
    if (!this.checkTicketManagerAccess('perform bulk deletions')) {
      return;
    }
    if (!this.hasSelectedTickets()) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedTickets.size} tickets? This action cannot be undone.`)) {
      this.bulkDeleteTickets();
    }
  }
  
  bulkDeleteTickets(): void {
    if (!this.checkTicketManagerAccess('perform bulk deletions')) {
      return;
    }
    if (!this.hasSelectedTickets()) return;
    
    const ticketIds = Array.from(this.selectedTickets);
    this.isLoading = true;
    
    this.ticketService.bulkDeleteTickets(ticketIds)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTickets();
            this.clearSelection();
            this.toastr.success(`Successfully deleted ${ticketIds.length} tickets`, 'Success');
          } else {
            this.toastr.error(response.message || 'Failed to delete tickets', 'Error');
          }
        },
        error: (err) => {
          console.error('Error deleting tickets:', err);
          this.toastr.error('Failed to delete tickets. Please try again.', 'Error');
        }
      });
  }

  checkTicketManagerStatus(): void {
    this.ticketManagerService.getCurrentTicketManager().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const ticketManager = response.data;
          const currentUser = this.userProfileService.currentUserValue;
          if (currentUser) {
            this.isTicketManager = currentUser.id_User === ticketManager.id_User;
            console.log('Is ticket manager:', this.isTicketManager);
          }
        }
      },
      error: (err) => {
        console.error('Error checking ticket manager status:', err);
        this.isTicketManager = false;
      }
    });
  }

  goToTicketManager(): void {
    console.log('Navigating to ticket manager...');
    this.router.navigate(['../ticket-manager'], { relativeTo: this.route }).then(() => {
      console.log('Navigation completed');
    }).catch(err => {
      console.error('Navigation failed:', err);
    });
  }

  // Add helper methods for ticket manager actions
  private checkTicketManagerAccess(action: string): boolean {
    if (!this.isTicketManager) {
      this.toastr.warning(
        `Only the ticket manager can ${action}. Please contact the ticket manager for assistance.`,
        'Access Restricted',
        { timeOut: 5000 }
      );
      return false;
    }
    return true;
  }

  canDeleteTicket(ticket: Ticket): boolean {
    const currentUser = this.userProfileService.currentUserValue;
    if (!currentUser) return false;

    // Ticket manager can delete any ticket
    if (this.isTicketManager) return true;

    // Regular users can only delete their own OPEN tickets
    return ticket.submitter?.id_User === currentUser.id_User && ticket.status === 'OPEN';
  }

  getDeleteButtonTooltip(ticket: Ticket): string {
    if (this.isTicketManager) return 'Delete ticket';
    if (!this.canDeleteTicket(ticket)) {
      return 'Only ticket managers can delete non-OPEN tickets or tickets from other users';
    }
    return 'Delete your ticket';
  }

  // Error handling for API calls
  private handleError(error: any, action: string): void {
    let message = 'An error occurred';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }
    
    if (error.status === 403) {
      this.toastr.warning(
        message,
        'Access Restricted',
        { timeOut: 5000 }
      );
    } else {
      this.toastr.error(
        message,
        `Failed to ${action}`,
        { timeOut: 5000 }
      );
    }
  }

  openAssignModal(ticket: Ticket): void {
    if (!this.checkTicketManagerAccess('assign tickets')) {
      return;
    }
    
    // Reset selection
    this.selectedTickets.clear();
    if (ticket.id) {
      this.selectedTickets.add(ticket.id);
    }
    this.selectedAdminUsername = '';
    
    if (this.assignTicketsModal) {
      this.assignTicketsModal.show();
    }
  }

  openUnassignModal(ticket: Ticket): void {
    if (!this.checkTicketManagerAccess('unassign tickets')) {
      return;
    }
    
    // Reset selection
    this.selectedTickets.clear();
    if (ticket.id) {
      this.selectedTickets.add(ticket.id);
    }
    
    if (this.unassignModal) {
      this.unassignModal.show();
    }
  }
} 