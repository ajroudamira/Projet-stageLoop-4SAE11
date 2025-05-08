import { Component, OnInit } from '@angular/core';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, CandidatureStatus } from '../../../core/models/candidature.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditCandidatureDialogComponent } from '../edit-candidature-dialog/edit-candidature-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-candidature',
  templateUrl: './admin-candidature.component.html',
  styleUrls: ['./admin-candidature.component.scss']
})
export class AdminCandidatureComponent implements OnInit {
  candidatures: Candidature[] = [];
  loading = false;
  searchKeyword = '';
  filteredCandidatures: Candidature[] = [];
  totalStudents = 0;
  totalCandidatures = 0;
  statusStats = { PENDING: 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };

  constructor(
    private candidatureService: CandidatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllCandidatures();
  }

  loadAllCandidatures(): void {
    this.loading = true;
    this.candidatureService.getAllCandidatures().subscribe({
      next: (response: ApiResponse<Candidature[]>) => {
        this.candidatures = response.data || [];
        this.filteredCandidatures = this.candidatures;
        this.loading = false;
        this.computeStatistics();
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error loading candidatures', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  computeStatistics(): void {
    // Unique students
    const studentIds = new Set<string>();
    this.statusStats = { PENDING: 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };
    for (const c of this.candidatures) {
      if (c.student && c.student.login) {
        studentIds.add(c.student.login);
      }
      if (c.status && this.statusStats.hasOwnProperty(c.status)) {
        this.statusStats[c.status]++;
      }
    }
    this.totalStudents = studentIds.size;
    this.totalCandidatures = this.candidatures.length;
  }

  searchCandidatures(): void {
    if (this.searchKeyword.trim()) {
      const query = this.searchKeyword.trim().toLowerCase();
      this.filteredCandidatures = this.candidatures.filter(c => {
        return (
          (c.id?.toString().includes(query) || false) ||
          (c.motivationLetter?.toLowerCase().includes(query) || false) ||
          (c.cvUrl?.toLowerCase().includes(query) || false) ||
          (c.student?.email?.toLowerCase().includes(query) || false) ||
          (c.student?.login?.toLowerCase().includes(query) || false) ||
          (c.status?.toLowerCase().includes(query) || false)
        );
      });
    } else {
      this.loadAllCandidatures();
      this.filteredCandidatures = this.candidatures;
    }
  }

  openEditDialog(candidature: Candidature): void {
    const dialogRef = this.dialog.open(EditCandidatureDialogComponent, {
      width: '500px',
      data: { candidature }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCandidatures();
      }
    });
  }

  deleteCandidature(id: number): void {
    if (confirm('Are you sure you want to delete this candidature?')) {
      this.candidatureService.adminDeleteCandidature(id).subscribe({
        next: () => {
          this.snackBar.open('Candidature deleted successfully', 'Close', { duration: 3000 });
          this.loadAllCandidatures();
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open('Error deleting candidature', 'Close', { duration: 3000 });
        }
      });
    }
  }

  checkExpiredCandidatures(): void {
    this.candidatureService.checkExpiredCandidatures().subscribe({
      next: () => {
        this.snackBar.open('Expired candidatures checked and updated', 'Close', { duration: 3000 });
        this.loadAllCandidatures();
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error checking expired candidatures', 'Close', { duration: 3000 });
      }
    });
  }

  deleteOldCandidatures(): void {
    if (confirm('Are you sure you want to delete all expired candidatures?')) {
      this.candidatureService.deleteOldCandidatures().subscribe({
        next: () => {
          this.snackBar.open('Old candidatures deleted successfully', 'Close', { duration: 3000 });
          this.loadAllCandidatures();
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open('Error deleting old candidatures', 'Close', { duration: 3000 });
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

  getCvDownloadUrl(cvUrl: string): string {
    if (!cvUrl) return '';
    if (cvUrl.startsWith('http')) return cvUrl;
    return `http://localhost:9090/api/service/candidature/cv/${cvUrl}`;
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

  clearSearch(): void {
    this.searchKeyword = '';
    this.searchCandidatures();
  }
} 