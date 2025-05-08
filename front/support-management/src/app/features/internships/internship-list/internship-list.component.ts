import { Component, OnInit } from '@angular/core';
import { InternshipService, Internship } from '../../../services/internship.service';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCandidatureDialogComponent } from '../../candidature/add-candidature-dialog/add-candidature-dialog.component';

@Component({
  selector: 'app-internship-list',
  templateUrl: './internship-list.component.html',
  styleUrls: ['./internship-list.component.scss']
})
export class InternshipListComponent implements OnInit {
  internships: Internship[] = [];
  filteredInternships: Internship[] = [];
  searchTerm: string = '';
  internshipTypes: string[] = [
    'INTERNSHIP',
    'END_OF_STUDIES_PROJECT',
    'RESEARCH',
    'INDUSTRIAL'
  ];
  internshipStatuses: string[] = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'COMPLETED'
  ];
  isAdmin = false;
  isStudent = false;
  isUser = false;
  isPartner = false;
  loading = false;
  error = '';
  selectedType: string = '';

  constructor(
    private internshipService: InternshipService,
    private router: Router,
    private userProfileService: UserProfileService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.isStudent = user?.role === 'student';
      this.isUser = user?.role === 'user';
      this.isPartner = user?.role === 'partner';
      if (user?.role === 'partner' && user.id_User) {
        this.loadPartnerInternships(user.id_User);
      } else {
        this.loadInternships();
      }
    });
  }

  loadInternships(): void {
    this.loading = true;
    this.internshipService.getAllInternships().subscribe({
      next: (data) => {
        this.internships = data;
        this.filterInternships();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading internships';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadPartnerInternships(partnerId: number): void {
    this.loading = true;
    this.internshipService.getInternshipsByPartner(partnerId).subscribe({
      next: (data) => {
        this.internships = data;
        this.filterInternships();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading internships';
        this.loading = false;
        console.error(err);
      }
    });
  }

  filterInternships(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredInternships = this.internships.filter(i =>
      (this.selectedType ? i.type === this.selectedType : true) &&
      (i.title?.toLowerCase().includes(term) ||
        i.type?.toLowerCase().includes(term) ||
        i.requiredSkills?.toLowerCase().includes(term))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterInternships();
  }

  countByType(type: string): number {
    return this.internships.filter(i => i.type === type).length;
  }

  countByStatus(status: string): number {
    return this.internships.filter(i => i.status === status).length;
  }

  updateInternship(id: number): void {
    this.router.navigate(['/internships', id]);
  }

  createInternship(): void {
    this.router.navigate(['/internships/create']);
  }

  deleteInternship(id: number): void {
    if (confirm('Are you sure you want to delete this internship?')) {
      this.internshipService.deleteInternship(id).subscribe({
        next: () => {
          this.internships = this.internships.filter(i => i.idInternship !== id);
          this.filterInternships();
        },
        error: (err) => {
          this.error = 'Error deleting internship';
          console.error(err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }

  updateInternshipStatus(internship: Internship, newStatus: string): void {
    if (internship.status === newStatus) return;
    this.internshipService.updateInternshipStatus(internship.idInternship, newStatus).subscribe({
      next: (updated) => {
        internship.status = updated.status;
      },
      error: (err) => {
        this.error = 'Error updating status';
        console.error(err);
      }
    });
  }

  openPostulateDialog(internship: Internship): void {
    const dialogRef = this.dialog.open(AddCandidatureDialogComponent, {
      width: '600px',
      data: { internship }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Optionally refresh candidatures or show a message
    });
  }

  viewInternship(id: number): void {
    this.router.navigate(['/internships', id, 'view']);
  }
} 