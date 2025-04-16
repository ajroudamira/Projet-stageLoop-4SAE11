import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  ticketForm: FormGroup;
  currentUser: User | null = null;
  ticketId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  error = '';
  successMessage = '';
  
  // Enum values for dropdown options
  categories = Object.values(TicketCategory);
  priorities = Object.values(TicketPriority);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private userProfileService: UserProfileService
  ) {
    this.ticketForm = this.createForm();
  }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.ticketId = +params['id'];
        this.isEditMode = true;
        this.loadTicket();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: [TicketCategory.TECHNICAL, Validators.required],
      priority: [TicketPriority.MEDIUM, Validators.required]
    });
  }

  loadTicket(): void {
    if (!this.ticketId) return;

    this.isLoading = true;
    this.error = '';

    this.ticketService.getTicketById(this.ticketId).subscribe(
      response => {
        if (response.success && response.data) {
          const ticket = response.data;
          
          // Check if user is allowed to edit this ticket
          if (this.canModifyTicket(ticket)) {
            this.ticketForm.patchValue({
              title: ticket.title,
              description: ticket.description,
              category: ticket.category,
              priority: ticket.priority
            });
          } else {
            this.error = 'You are not authorized to edit this ticket';
            setTimeout(() => {
              this.router.navigate(['/tickets']);
            }, 3000);
          }
        } else {
          this.error = response.message || 'Failed to load ticket details';
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error loading ticket:', error);
        this.error = 'An error occurred while loading ticket details';
        this.isLoading = false;
      }
    );
  }

  canModifyTicket(ticket: Ticket): boolean {
    if (!this.currentUser) return false;
    
    // User can modify if they created the ticket and it's still OPEN
    const isCreator = ticket.submitter?.id_User === this.currentUser.id_User || 
                      ticket.student?.id_User === this.currentUser.id_User;
    return isCreator && ticket.status === TicketStatus.OPEN;
  }

  onSubmit(): void {
    if (this.ticketForm.invalid || !this.currentUser) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';

    const formValues = this.ticketForm.value;
    
    if (this.isEditMode && this.ticketId) {
      // Update existing ticket
      this.ticketService.getTicketById(this.ticketId).subscribe(
        response => {
          if (response.success && response.data) {
            const ticket = response.data;
            
            // Update only allowed fields
            ticket.title = formValues.title;
            ticket.description = formValues.description;
            ticket.category = formValues.category;
            ticket.priority = formValues.priority;
            
            this.ticketService.updateTicket(ticket).subscribe(
              updateResponse => {
                this.handleSubmitResponse(updateResponse, 'Ticket updated successfully');
              },
              error => {
                this.handleSubmitError(error);
              }
            );
          } else {
            this.error = 'Failed to load ticket for update';
            this.isSubmitting = false;
          }
        },
        error => {
          this.handleSubmitError(error);
        }
      );
    } else {
      // Create new ticket
      const newTicket: Ticket = {
        title: formValues.title,
        description: formValues.description,
        category: formValues.category,
        priority: formValues.priority,
        status: TicketStatus.OPEN,
        submitter: this.currentUser
      };
      
      this.ticketService.createTicket(newTicket).subscribe(
        response => {
          this.handleSubmitResponse(response, 'Ticket created successfully');
        },
        error => {
          this.handleSubmitError(error);
        }
      );
    }
  }

  private handleSubmitResponse(response: any, successMessage: string): void {
    if (response.success) {
      this.successMessage = successMessage;
      this.ticketForm.reset();
      
      // Redirect after successful submit
      setTimeout(() => {
        if (response.data?.id) {
          this.router.navigate(['/tickets', response.data.id]);
        } else {
          this.router.navigate(['/tickets']);
        }
      }, 2000);
    } else {
      this.error = response.message || 'Failed to submit ticket';
    }
    this.isSubmitting = false;
  }

  private handleSubmitError(error: any): void {
    console.error('Error submitting ticket:', error);
    this.error = 'An error occurred while submitting the ticket';
    this.isSubmitting = false;
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/tickets', this.ticketId]);
    } else {
      this.router.navigate(['/tickets']);
    }
  }
} 