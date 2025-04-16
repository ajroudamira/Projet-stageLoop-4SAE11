import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { CommentService } from '../../../core/services/comment.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { Comment } from '../../../core/models/comment.model';
import { Attachment } from '../../../core/models/attachment.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticketId!: number;
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  currentUser: User | null = null;
  isLoading = true;
  isLoadingComments = false;
  isLoadingAttachments = false;
  error = '';
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  editingCommentId: number | null = null;
  fileToUpload: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private userProfileService: UserProfileService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });

    this.editCommentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
   
    this.route.params.subscribe(params => {
      this.ticketId = +params['id'];
      this.loadTicket();
    });

    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log(this.currentUser);
    });
    console.log(this.currentUser);

  }

  loadTicket(): void {
    this.isLoading = true;
    this.error = '';

    this.ticketService.getTicketById(this.ticketId).subscribe(
      response => {
        if (response.success && response.data) {
          this.ticket = response.data;
          this.loadComments();
          this.loadAttachments();
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

  loadComments(): void {
    this.isLoadingComments = true;
    this.commentService.getCommentsByTicket(this.ticketId).subscribe(
      response => {
        if (response.success && response.data) {
          this.comments = Array.isArray(response.data.content) 
            ? response.data.content 
            : Array.isArray(response.data) 
              ? response.data 
              : [];
        } else {
          console.error('Failed to load comments:', response.message);
        }
        this.isLoadingComments = false;
      },
      error => {
        console.error('Error loading comments:', error);
        this.isLoadingComments = false;
      }
    );
  }

  loadAttachments(): void {
    this.isLoadingAttachments = true;
    this.attachmentService.getAttachmentsByTicket(this.ticketId).subscribe(
      response => {
        if (response.success && response.data) {
          this.attachments = Array.isArray(response.data) 
            ? response.data 
            : [];
        } else {
          console.error('Failed to load attachments:', response.message);
        }
        this.isLoadingAttachments = false;
      },
      error => {
        console.error('Error loading attachments:', error);
        this.isLoadingAttachments = false;
      }
    );
  }

  canModifyTicket(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    
    // User can modify if they created the ticket and it's still OPEN
    const isCreator = this.ticket.submitter?.id_User === this.currentUser.id_User || 
                      this.ticket.student?.id_User === this.currentUser.id_User;
    return isCreator && this.ticket.status === TicketStatus.OPEN;
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.ticket || !this.currentUser) {
      return;
    }

    const comment: Comment = {
      content: this.commentForm.value.content,
      internal: false,
      ticket: this.ticket,
      author: this.currentUser
    };

    this.commentService.addComment(comment).subscribe(
      response => {
        if (response.success) {
          this.commentForm.reset();
          this.loadComments();
        } else {
          alert('Failed to add comment: ' + response.message);
        }
      },
      error => {
        console.error('Error adding comment:', error);
        alert('An error occurred while adding the comment');
      }
    );
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.fileToUpload = input.files[0];
      this.uploadError = '';
    }
  }
  

  uploadFile(): void {
    if (!this.fileToUpload || !this.currentUser?.id_User) {
      this.uploadError = 'Please select a file to upload';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    this.attachmentService.uploadAttachment(
      this.fileToUpload, 
      this.ticketId, 
      this.currentUser.id_User
    ).subscribe(
      response => {
        if (response.success) {
          this.fileToUpload = null;
          this.loadAttachments();
        } else {
          this.uploadError = response.message || 'Failed to upload file';
        }
        this.isUploading = false;
        this.uploadProgress = 100;
      },
      error => {
        console.error('Error uploading file:', error);
        this.uploadError = 'An error occurred while uploading the file';
        this.isUploading = false;
      }
    );
  }

  downloadAttachment(attachmentId: number): void {
    this.attachmentService.downloadAttachment(attachmentId).subscribe(
      blob => {
        const attachment = this.attachments.find(a => a.id === attachmentId);
        if (attachment) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        }
      },
      error => {
        console.error('Error downloading attachment:', error);
        alert('Failed to download attachment');
      }
    );
  }

  deleteAttachment(attachmentId: number): void {
    if (confirm('Are you sure you want to delete this attachment?')) {
      this.attachmentService.deleteAttachment(attachmentId).subscribe(
        response => {
          if (response.success) {
            this.loadAttachments();
          } else {
            alert('Failed to delete attachment: ' + response.message);
          }
        },
        error => {
          console.error('Error deleting attachment:', error);
          alert('An error occurred while deleting the attachment');
        }
      );
    }
  }

  editTicket(): void {
    this.router.navigate(['/tickets/edit', this.ticketId]);
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }

  editComment(comment: Comment): void {
    this.editingCommentId = comment.id || null;
    this.editCommentForm.patchValue({
      content: comment.content
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }

  updateComment(comment: Comment): void {
    if (this.editCommentForm.invalid || !this.ticket) return;

    const updatedComment: Comment = {
      id: comment.id,
      content: this.editCommentForm.value.content,
      internal: comment.internal,
      ticket: this.ticket,
      author: comment.author || comment.user,
      user: comment.user || comment.author
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
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(comment.id!).subscribe({
        next: (response) => {
          if (response.success) {
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
} 