import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentRequestService, StudentRequest } from 'src/app/core/services/student-request.service';

@Component({
  selector: 'app-admin-student-requests',
  templateUrl: './admin-student-requests.component.html',
  styleUrls: ['./admin-student-requests.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  providers: [DatePipe]
})
export class AdminStudentRequestsComponent implements OnInit {
  requests: StudentRequest[] = [];
  loading = true;
  error: string | null = null;
  actionLoading: number | null = null;

  constructor(private studentRequestService: StudentRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.studentRequestService.getPendingRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load student requests.';
        this.loading = false;
      }
    });
  }

  approve(req: StudentRequest) {
    if (!req.id) return;
    this.actionLoading = req.id;
    this.studentRequestService.approveRequest(req.id).subscribe({
      next: () => {
        this.loadRequests();
        this.actionLoading = null;
      },
      error: () => {
        this.error = 'Failed to approve request';
        this.actionLoading = null;
      }
    });
  }

  reject(req: StudentRequest) {
    if (!req.id) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    this.actionLoading = req.id;
    this.studentRequestService.rejectRequest(req.id, reason).subscribe({
      next: () => {
        this.loadRequests();
        this.actionLoading = null;
      },
      error: () => {
        this.error = 'Failed to reject request';
        this.actionLoading = null;
      }
    });
  }
} 