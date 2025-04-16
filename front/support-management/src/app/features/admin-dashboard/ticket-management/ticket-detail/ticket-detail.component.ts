import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';
import { CommentService } from '../../../../core/services/comment.service';
import { AttachmentService } from '../../../../core/services/attachment.service';
import { UserService } from '../../../../core/services/user.service';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { Ticket, TicketStatus, TicketPriority } from '../../../../core/models/ticket.model';
import { Comment } from '../../../../core/models/comment.model';
import { Attachment } from '../../../../core/models/attachment.model';
import { User } from '../../../../core/models/user.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipPosition } from '@angular/material/tooltip';
import { ApiResponse } from '../../../../core/models/api-response.model';

// For Modal handling
declare var bootstrap: any;

interface TicketActivity {
  type: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  tooltipPosition: TooltipPosition = 'above';
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  supportUsers: User[] = [];
  ticketActivities: TicketActivity[] = [];
  
  // Forms
  commentForm: FormGroup;
  assignForm: FormGroup;
  statusForm: FormGroup;
  priorityForm: FormGroup;
  editCommentForm: FormGroup;
  
  // File upload
  selectedFile: File | null = null;
  
  // Loading states
  isLoading = true;
  isLoadingComments = false;
  isLoadingAttachments = false;
  isSubmittingComment = false;
  isAssigning = false;
  isUpdatingStatus = false;
  isUpdatingPriority = false;
  isUploading = false;
  
  // Modal references
  assignModal: any;
  statusModal: any;
  priorityModal: any;
  fileUploadModal: any;
  
  // Error handling
  error: string | null = null;
  
  editingCommentId: number | null = null;
  currentUser: any = null;
  isTicketManager: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private userService: UserService,
    private userProfileService: UserProfileService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      internal: [false]
    });
    
    this.assignForm = this.fb.group({
      assigneeId: ['']
    });
    
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });
    
    this.priorityForm = this.fb.group({
      priority: ['', Validators.required]
    });
    
    this.editCommentForm = this.fb.group({
      content: ['', Validators.required],
      internal: [false]
    });
    this.currentUser = this.userProfileService.currentUserValue;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const ticketId = params.get('id');
      if (ticketId) {
        this.loadTicket(+ticketId);
      } else {
        this.error = 'Ticket ID is missing';
        this.isLoading = false;
      }
    });

    // Initialize bootstrap modals after view init
    setTimeout(() => {
      this.initModals();
    }, 100);

    this.checkTicketManagerStatus();
  }

  loadTicket(ticketId: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.ticket = response.data;
          
          // Initialize form values based on ticket
          this.statusForm.patchValue({ status: this.ticket.status });
          this.priorityForm.patchValue({ priority: this.ticket.priority });
          if (this.ticket.assignedAdmin) {
            this.assignForm.patchValue({ assigneeId: this.ticket.assignedAdmin.login });
          }
          
          // Load related data
          this.loadComments(ticketId);
          this.loadAttachments(ticketId);
          this.loadSupportUsers();
          this.generateTicketActivities();
        } else {
          this.error = response.message || 'Failed to load ticket details';
          this.ticket = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading ticket:', err);
        this.error = 'Failed to load ticket. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadComments(ticketId: number): void {
    this.isLoadingComments = true;
    
    this.commentService.getCommentsByTicket(ticketId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Check if it's a paginated response or direct array
          if (Array.isArray(response.data)) {
            this.comments = response.data;
          } else if (response.data.content) {
            this.comments = response.data.content;
          } else {
            this.comments = [];
          }
        } else {
          this.comments = [];
        }
        console.log("🚀 ~ TicketDetailComponent ~ this.commentService.getCommentsByTicket ~ response.data:", response.data)
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.comments = [];
        this.isLoadingComments = false;
      }
    });
  }

  loadAttachments(ticketId: number): void {
    this.isLoadingAttachments = true;
    
    this.attachmentService.getAttachmentsByTicket(ticketId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.attachments = response.data;
        } else {
          this.attachments = [];
        }
        this.isLoadingAttachments = false;
      },
      error: (err) => {
        console.error('Error loading attachments:', err);
        this.attachments = [];
        this.isLoadingAttachments = false;
      }
    });
  }

  loadSupportUsers(): void {
    console.log('Loading support users from backend...');
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Full user response from backend:', response);
        
        // Check if response is already an array (direct data)
        if (Array.isArray(response)) {
          this.supportUsers = response.filter(user => user.role === 'admin');
          console.log('Found admin users from array response:', this.supportUsers);
          
          if (this.supportUsers.length === 0) {
            console.warn('No admin users found in array response. Attempting to sync from Keycloak...');
            this.syncUsersFromKeycloak();
          }
          return;
        }
        
        // Check if it's a success response with data
        if (response.success && response.data) {
          // Filter for admin users only
          this.supportUsers = Array.isArray(response.data) 
            ? response.data.filter(user => user.role === 'admin')
            : [];
          console.log('Found admin users from backend:', this.supportUsers);
          
          if (this.supportUsers.length === 0) {
            console.warn('No admin users found in the backend response. Attempting to sync from Keycloak...');
            this.syncUsersFromKeycloak();
          }
        } 
        // If we have data but not wrapped in success structure
        else if (response.data && Array.isArray(response.data)) {
          this.supportUsers = response.data.filter(user => user.role === 'admin');
          console.log('Found admin users from data-only response:', this.supportUsers);
          
          if (this.supportUsers.length === 0) {
            console.warn('No admin users found in data-only response. Attempting to sync from Keycloak...');
            this.syncUsersFromKeycloak();
          }
        }
        // If direct data without any structure
        else if (response && !response.success && !Array.isArray(response)) {
          // Try to use the response directly if it looks like an array of users
          try {
            const possibleUsers = Object.values(response);
            if (possibleUsers.length > 0 && typeof possibleUsers[0] === 'object') {
              this.supportUsers = possibleUsers.filter((user: any) => user.role === 'admin');
              console.log('Found admin users from unstructured response:', this.supportUsers);
              
              if (this.supportUsers.length === 0) {
                console.warn('No admin users found in unstructured response. Attempting to sync from Keycloak...');
                this.syncUsersFromKeycloak();
              }
              return;
            }
          } catch (e) {
            console.error('Error processing unstructured response:', e);
          }
          
          console.error('Failed to load users or no data returned:', response);
          // Try to sync users from Keycloak
          this.syncUsersFromKeycloak();
        } else {
          console.error('Failed to load users or no data returned:', response);
          // Try to sync users from Keycloak
          this.syncUsersFromKeycloak();
        }
      },
      error: (err) => {
        console.error('Error loading admin users from backend:', err);
        // Try to sync users from Keycloak
        this.syncUsersFromKeycloak();
      }
    });
  }

  syncUsersFromKeycloak(): void {
    console.log('Attempting to sync users from Keycloak...');
    this.userService.syncUsersFromKeycloak().subscribe({
      next: (response) => {
        console.log('Sync from Keycloak response:', response);
        if (response.success) {
          console.log('Successfully synced users from Keycloak, reloading user list...');
          // Reload the user list after syncing
          setTimeout(() => {
            this.loadSupportUsers();
          }, 1000); // Wait 1 second before reloading to allow backend processing
        } else {
          console.error('Failed to sync users from Keycloak:', response.message);
        }
      },
      error: (err) => {
        console.error('Error syncing users from Keycloak:', err);
      }
    });
  }

  addComment(): void {
    if (this.commentForm.invalid || !this.ticket) return;
    
    this.isSubmittingComment = true;
    
    // Get the current user from the UserProfileService
    const currentUser = this.userProfileService.currentUserValue;
    
    if (!currentUser || !currentUser.id_User) {
      console.error('No current user found or missing user ID');
      this.isSubmittingComment = false;
      return;
    }
    
    const commentData: Comment = {
      content: this.commentForm.value.content,
      internal: this.commentForm.value.internal,
      ticket: this.ticket,
      author: currentUser
    };
    
    console.log('Sending comment data:', commentData);
    
    this.commentService.addComment(commentData).pipe(
      finalize(() => this.isSubmittingComment = false)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Add the new comment to the list
          this.comments.unshift(response.data);
          // Reset the form
          this.commentForm.reset({ content: '', internal: false });
        } else {
          console.error('Failed to add comment:', response.message);
        }
      },
      error: (err) => {
        console.error('Error adding comment:', err);
      }
    });
  }

  editComment(comment: Comment): void {
    this.editingCommentId = comment.id || null;
    this.editCommentForm.patchValue({
      content: comment.content,
      internal: comment.internal
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }

  updateComment(comment: Comment): void {
    if (this.editCommentForm.invalid || !this.ticket) return;

    // Create a new comment object with all required fields
    const updatedComment: Comment = {
      id: comment.id,
      content: this.editCommentForm.value.content,
      internal: this.editCommentForm.value.internal,
      ticket: this.ticket,
      author: comment.author || comment.user,  // Use either author or user
      user: comment.user || comment.author     // Use either user or author
    };

    this.commentService.updateComment(updatedComment).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const index = this.comments.findIndex(c => c.id === comment.id);
          if (index !== -1) {
            this.comments[index] = response.data;
          }
          this.cancelEdit();
        } else {
          console.error('Failed to update comment:', response.message);
        }
      },
      error: (err) => {
        console.error('Error updating comment:', err);
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (!comment.id) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(comment.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove the comment from the list
            this.comments = this.comments.filter(c => c.id !== comment.id);
          } else {
            console.error('Failed to delete comment:', response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
        }
      });
    }
  }

  downloadAttachment(attachment: Attachment): void {
    if (!attachment.id) return;
    
    this.attachmentService.downloadAttachment(attachment.id).subscribe({
      next: (blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading attachment:', err);
      }
    });
  }

  deleteAttachment(attachment: Attachment): void {
    if (!attachment.id) return;
    
    if (confirm('Are you sure you want to delete this attachment?')) {
      this.attachmentService.deleteAttachment(attachment.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove the attachment from the list
            this.attachments = this.attachments.filter(a => a.id !== attachment.id);
          } else {
            console.error('Failed to delete attachment:', response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting attachment:', err);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.ticket || !this.ticket.id) return;
    
    this.isUploading = true;
    
    // Get the current user ID from the UserProfileService
    const currentUser = this.userProfileService.currentUserValue;
    
    if (!currentUser || !currentUser.id_User) {
      console.error('No current user found or missing user ID');
      this.isUploading = false;
      this.selectedFile = null;
      return;
    }
    
    this.attachmentService.uploadAttachment(this.selectedFile, this.ticket.id, currentUser.id_User).pipe(
      finalize(() => {
        this.isUploading = false;
        this.selectedFile = null;
        // Close the modal
        if (this.fileUploadModal) {
          this.fileUploadModal.hide();
        }
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Add the new attachment to the list
          this.attachments.push(response.data);
        } else {
          console.error('Failed to upload attachment:', response.message);
        }
      },
      error: (err) => {
        console.error('Error uploading attachment:', err);
      }
    });
  }

  assignTicket(): void {
    if (!this.ticket || !this.ticket.id) return;
    
    this.isAssigning = true;
    const adminUsername = this.assignForm.value.assigneeId;
    
    // The adminUsername is now directly the login value from the form
    // No need to search for the admin user since we've changed the select value
    
    this.ticketService.assignTicket(this.ticket.id, adminUsername).pipe(
      finalize(() => {
        this.isAssigning = false;
        // Close the modal
        if (this.assignModal) {
          this.assignModal.hide();
        }
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the ticket with the new assignee
          this.ticket = response.data;
        } else {
          console.error('Failed to assign ticket:', response.message);
        }
      },
      error: (err) => {
        console.error('Error assigning ticket:', err);
      }
    });
  }

  unassignTicket(): void {
    if (!this.ticket || !this.ticket.id) return;
    
    this.isAssigning = true;
    
    // Call the unassign method
    this.ticketService.unassignTicket(this.ticket.id).pipe(
      finalize(() => {
        this.isAssigning = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the ticket with no assignee
          this.ticket = response.data;
        } else {
          console.error('Failed to unassign ticket:', response.message);
        }
      },
      error: (err) => {
        console.error('Error unassigning ticket:', err);
        // Show user-friendly error
        this.error = 'Failed to unassign ticket. Please try again.';
        setTimeout(() => this.error = null, 5000); // Clear error after 5 seconds
      }
    });
  }

  updateStatus(): void {
    if (!this.ticket || !this.ticket.id) return;
    
    this.isUpdatingStatus = true;
    const newStatus = this.statusForm.value.status;
    
    this.ticketService.changeTicketStatus(this.ticket.id, newStatus).pipe(
      finalize(() => {
        this.isUpdatingStatus = false;
        // Close the modal
        if (this.statusModal) {
          this.statusModal.hide();
        }
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the ticket with the new status
          this.ticket = response.data;
        } else {
          console.error('Failed to update status:', response.message);
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
      }
    });
  }

  updatePriority(): void {
    if (!this.ticket || !this.ticket.id) return;
    
    this.isUpdatingPriority = true;
    const newPriority = this.priorityForm.value.priority;
    
    // Update the ticket object
    if (this.ticket) {
      const updatedTicket: Ticket = {
        ...this.ticket,
        priority: newPriority as TicketPriority
      };
      
      this.ticketService.updateTicket(updatedTicket).pipe(
        finalize(() => {
          this.isUpdatingPriority = false;
          // Close the modal
          if (this.priorityModal) {
            this.priorityModal.hide();
          }
        })
      ).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update the ticket with the new priority
            this.ticket = response.data;
          } else {
            console.error('Failed to update priority:', response.message);
          }
        },
        error: (err) => {
          console.error('Error updating priority:', err);
        }
      });
    }
  }

  deleteTicket(): void {
    if (!this.ticket || !this.ticket.id) return;
    
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      this.ticketService.deleteTicket(this.ticket.id).subscribe({
        next: (response) => {
          // Navigate back to the ticket list
          this.router.navigate(['/admin/tickets']);
        },
        error: (err) => {
          console.error('Error deleting ticket:', err);
        }
      });
    }
  }

  // Modal handlers
  initModals(): void {
    try {
      const assignTicketEl = document.getElementById('assignTicketModal');
      const statusModalEl = document.getElementById('statusModal');
      const priorityModalEl = document.getElementById('priorityModal');
      const fileUploadModalEl = document.getElementById('fileUploadModal');
      
      if (assignTicketEl) {
        this.assignModal = new bootstrap.Modal(assignTicketEl);
      }
      
      if (statusModalEl) {
        this.statusModal = new bootstrap.Modal(statusModalEl);
      }
      
      if (priorityModalEl) {
        this.priorityModal = new bootstrap.Modal(priorityModalEl);
      }
      
      if (fileUploadModalEl) {
        this.fileUploadModal = new bootstrap.Modal(fileUploadModalEl);
      }
    } catch (error) {
      console.error('Error initializing modals:', error);
    }
  }

  openAssignModal(): void {
    if (this.assignModal) {
      this.assignModal.show();
    }
  }

  openStatusModal(): void {
    if (this.statusModal) {
      this.statusModal.show();
    }
  }

  openPriorityModal(): void {
    if (this.priorityModal) {
      this.priorityModal.show();
    }
  }

  openFileUploadModal(): void {
    if (this.fileUploadModal) {
      this.fileUploadModal.show();
    }
  }

  // Helper functions
  formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(2) + ' KB';
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  }

  getInitials(user: User | undefined): string {
    if (!user || !user.firstName || !user.lastName) {
      return 'U';
    }
    return user.firstName.charAt(0) + user.lastName.charAt(0);
  }

  getStatusClass(status: TicketStatus): string {
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

  getPriorityClass(priority: TicketPriority): string {
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

  getActivityIcon(type: string): string {
    switch (type) {
      case 'create':
        return 'add_circle';
      case 'update':
        return 'edit';
      case 'status':
        return 'sync';
      case 'priority':
        return 'flag';
      case 'assign':
        return 'person';
      case 'comment':
        return 'chat';
      case 'attach':
        return 'attach_file';
      case 'delete':
        return 'delete';
      case 'unassign':
        return 'person_remove';
      default:
        return 'info';
    }
  }

  // For demo purposes only - in a real app, these would come from the backend
  generateTicketActivities(): void {
    if (!this.ticket) return;
    
    this.ticketActivities = [
      {
        type: 'create',
        message: 'Ticket created',
        timestamp: this.ticket.createdAt || new Date()
      },
      {
        type: 'update',
        message: 'Description updated',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        type: 'status',
        message: 'Status changed to In Progress',
        timestamp: new Date(Date.now() - 43200000) // 12 hours ago
      },
      {
        type: 'priority',
        message: 'Priority changed to High',
        timestamp: new Date(Date.now() - 21600000) // 6 hours ago
      },
      {
        type: 'assign',
        message: 'Assigned to John Doe',
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ];
  }

  goBack(): void {
    this.router.navigate(['/admin/tickets']);
  }

  private checkTicketManagerStatus() {
    this.userService.findByIsTicketManager(true).subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success && response.data) {
          const ticketManagers = response.data;
          this.isTicketManager = ticketManagers.some(manager => manager.id_User === this.currentUser?.id_User);
        } else {
          console.error('Failed to fetch ticket managers:', response.message);
          this.isTicketManager = false;
        }
      },
      error: (error: Error) => {
        console.error('Error fetching ticket managers:', error);
        this.isTicketManager = false;
      }
    });
  }

  canDeleteTicket(): boolean {
    return this.isTicketManager;
  }

  getDeleteButtonTooltip(): string {
    return this.isTicketManager ? 'Delete ticket' : 'Only ticket managers can delete tickets';
  }
} 