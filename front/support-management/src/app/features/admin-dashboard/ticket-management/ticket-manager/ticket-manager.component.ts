import { Component, OnInit } from '@angular/core';
import { TicketManagerService } from '../../../../core/services/ticket-manager.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-manager',
  templateUrl: './ticket-manager.component.html',
  styleUrls: ['./ticket-manager.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class TicketManagerComponent implements OnInit {
  currentTicketManager: User | null = null;
  admins: User[] = [];
  selectedAdmin: string = '';
  currentUser: User | null = null;
  isLoading = false;
  tickets: any[] = [];

  constructor(
    private ticketManagerService: TicketManagerService,
    private userService: UserService,
    private toastr: ToastrService,
    private ticketService: TicketService
  ) { }

  ngOnInit(): void {
    this.userService.findByIsTicketManager(true).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // User is a ticket manager
          this.loadTickets();
        } else {
          console.warn('User is not a ticket manager');
          // Handle non-ticket manager case
        }
      },
      error: (error) => {
        console.error('Error checking ticket manager status:', error);
      }
    });
    this.loadCurrentTicketManager();
    this.loadAdmins();
  }

  loadCurrentTicketManager(): void {
    this.ticketManagerService.getCurrentTicketManager().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentTicketManager = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading current ticket manager:', error);
      }
    });
  }

  loadAdmins(): void {
    this.userService.getAdmins().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.admins = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading admins:', error);
      }
    });
  }

  assignTicketManager(): void {
    if (!this.selectedAdmin) {
      this.toastr.warning('Please select an admin');
      return;
    }

    this.isLoading = true;
    this.ticketManagerService.assignTicketManager(this.selectedAdmin).subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.success && response.data) {
          this.toastr.success('Ticket manager role assigned successfully');
          this.loadCurrentTicketManager();
        } else {
          this.toastr.error(response.message || 'Failed to assign ticket manager');
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error assigning ticket manager:', err);
        this.toastr.error('Failed to assign ticket manager');
        this.isLoading = false;
      }
    });
  }

  resignAsTicketManager(): void {
    this.isLoading = true;
    this.ticketManagerService.resignAsTicketManager().subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.success && response.data) {
          this.toastr.success('Successfully resigned as ticket manager');
          this.loadCurrentTicketManager();
        } else {
          this.toastr.error(response.message || 'Failed to resign as ticket manager');
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error resigning as ticket manager:', err);
        this.toastr.error('Failed to resign as ticket manager');
        this.isLoading = false;
      }
    });
  }

  isCurrentUserTicketManager(): boolean {
    return this.currentUser?.id_User === this.currentTicketManager?.id_User;
  }

  private loadTickets(): void {
    // Load tickets with default parameters
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        if (response.success) {
          this.tickets = response.data;
        } else {
          console.warn('Failed to load tickets:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
      }
    });
  }
} 