import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, CandidatureStatus } from '../../../core/models/candidature.model';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-candidature-dialog',
  templateUrl: './edit-candidature-dialog.component.html',
  styleUrls: ['./edit-candidature-dialog.component.scss']
})
export class EditCandidatureDialogComponent {
  candidatureForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  statusOptions = [
    CandidatureStatus.PENDING,
    CandidatureStatus.ACCEPTED,
    CandidatureStatus.REJECTED,
    CandidatureStatus.EXPIRED
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCandidatureDialogComponent>,
    private candidatureService: CandidatureService,
    private userProfileService: UserProfileService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { candidature: Candidature }
  ) {
    this.candidatureForm = this.fb.group({
      motivationLetter: [data.candidature.motivationLetter, [Validators.required, Validators.minLength(100)]],
      status: [data.candidature.status, Validators.required],
      applicationDate: [this.formatDate(data.candidature.applicationDate), Validators.required],
      expirationDate: [data.candidature.expirationDate ? this.formatDate(data.candidature.expirationDate) : '']
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  getCvDownloadUrl(filename: string): string {
    return `${environment.apiUrl}/candidature/cv/${filename}`;
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.candidatureForm.valid) {
      this.isSubmitting = true;
      const buildCandidature = (cvUrl?: string): Candidature => ({
        motivationLetter: this.candidatureForm.get('motivationLetter')?.value,
        status: this.candidatureForm.get('status')?.value,
        applicationDate: new Date(this.candidatureForm.get('applicationDate')?.value),
        expirationDate: this.candidatureForm.get('expirationDate')?.value ? new Date(this.candidatureForm.get('expirationDate')?.value) : undefined,
        cvUrl: cvUrl || this.data.candidature.cvUrl,
        student: this.data.candidature.student,
        id: this.data.candidature.id
      });

      const updateCandidature = (candidature: Candidature) => {
        if (this.userProfileService.isAdmin()) {
          return this.candidatureService.adminUpdateCandidature(this.data.candidature.id!, candidature);
        } else {
          return this.candidatureService.updateCandidature(this.data.candidature.id!, candidature);
        }
      };

      if (this.selectedFile) {
        this.candidatureService.uploadFile(this.selectedFile).subscribe({
          next: (response) => {
            const candidature = buildCandidature(response.fileUrl);
            updateCandidature(candidature).subscribe({
              next: () => {
                this.snackBar.open('Candidature updated successfully', 'Close', { duration: 3000 });
                this.dialogRef.close(true);
              },
              error: (error: HttpErrorResponse) => {
                this.snackBar.open('Error updating candidature', 'Close', { duration: 3000 });
                console.error('Error updating candidature:', error);
              },
              complete: () => {
                this.isSubmitting = false;
              }
            });
          },
          error: (error) => {
            this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
            console.error('Error uploading file:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        const candidature = buildCandidature();
        updateCandidature(candidature).subscribe({
          next: () => {
            this.snackBar.open('Candidature updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            this.snackBar.open('Error updating candidature', 'Close', { duration: 3000 });
            console.error('Error updating candidature:', error);
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      }
    }
  }
} 