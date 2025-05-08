import { Component, OnInit } from '@angular/core';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, CandidatureStatus } from '../../../core/models/candidature.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partner-candidature',
  templateUrl: './partner-candidature.component.html',
  styleUrls: ['./partner-candidature.component.scss']
})
export class PartnerCandidatureComponent implements OnInit {
  candidatures: Candidature[] = [];
  loading = false;
  candidatureStatuses = Object.values(CandidatureStatus);

  constructor(
    private candidatureService: CandidatureService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCandidatures();
  }

  loadCandidatures(): void {
    this.loading = true;
    this.candidatureService.getCandidaturesByPartner().subscribe({
      next: (response: ApiResponse<Candidature[]>) => {
        this.candidatures = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error loading candidatures', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  viewInternship(id: number): void {
    this.router.navigate(['/internships', id, 'view']);
  }

  updateStatus(candidature: Candidature, newStatus: CandidatureStatus): void {
    if (candidature.status === newStatus) return;
    this.candidatureService.updateCandidatureStatusByPartner(candidature.id!, newStatus).subscribe({
      next: () => {
        candidature.status = newStatus;
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: CandidatureStatus): string {
    switch (status) {
      case CandidatureStatus.PENDING: return 'pending';
      case CandidatureStatus.ACCEPTED: return 'accepted';
      case CandidatureStatus.REJECTED: return 'rejected';
      case CandidatureStatus.EXPIRED: return 'expired';
      default: return '';
    }
  }

  getCvDownloadUrl(cvUrl: string): string {
    if (!cvUrl) return '';
    if (cvUrl.startsWith('http')) return cvUrl;
    return `http://localhost:9090/api/service/candidature/cv/${cvUrl}`;
  }
} 