import { Component, OnInit } from '@angular/core';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, CandidatureStatus } from '../../../core/models/candidature.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MatDialog } from '@angular/material/dialog';
import { AddCandidatureDialogComponent } from '../add-candidature-dialog/add-candidature-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-candidature',
  templateUrl: './student-candidature.component.html',
  styleUrls: ['./student-candidature.component.scss']
})
export class StudentCandidatureComponent implements OnInit {
  candidatures: Candidature[] = [];
  loading = false;

  constructor(
    private candidatureService: CandidatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMyCandidatures();
  }

  loadMyCandidatures(): void {
    this.loading = true;
    this.candidatureService.getMyCandidatures().subscribe({
      next: (response: ApiResponse<Candidature[]>) => {
        this.candidatures = response.data || [];
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error loading candidatures', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openAddCandidatureDialog(): void {
    const dialogRef = this.dialog.open(AddCandidatureDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMyCandidatures();
      }
    });
  }

  deleteCandidature(id: number): void {
    if (confirm('Are you sure you want to delete this candidature?')) {
      this.candidatureService.deleteCandidature(id).subscribe({
        next: () => {
          this.snackBar.open('Candidature deleted successfully', 'Close', { duration: 3000 });
          this.loadMyCandidatures();
        },
        error: () => {
          this.snackBar.open('Error deleting candidature', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: CandidatureStatus): string {
    switch (status) {
      case CandidatureStatus.ACCEPTED:
        return 'green';
      case CandidatureStatus.REJECTED:
        return 'red';
      case CandidatureStatus.EXPIRED:
        return 'orange';
      default:
        return 'blue';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      case 'EXPIRED': return 'expired';
      default: return '';
    }
  }

  editCandidature(candidature: Candidature) {
    const dialogRef = this.dialog.open(AddCandidatureDialogComponent, {
      width: '600px',
      data: { candidature }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMyCandidatures();
      }
    });
  }

  getCvDownloadUrl(cvUrl: string): string {
    if (!cvUrl) return '';
    if (cvUrl.startsWith('http')) return cvUrl;
    return `http://localhost:9090/api/service/candidature/cv/${cvUrl}`;
  }

  viewInternship(id: number): void {
    this.router.navigate(['/internships', id, 'view']);
  }
} 