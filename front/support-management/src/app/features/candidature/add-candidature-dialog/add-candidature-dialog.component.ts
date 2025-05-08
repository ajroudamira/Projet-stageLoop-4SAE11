import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature, CandidatureStatus } from '../../../core/models/candidature.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-candidature-dialog',
  templateUrl: './add-candidature-dialog.component.html',
  styleUrls: ['./add-candidature-dialog.component.scss']
})
export class AddCandidatureDialogComponent {
  candidatureForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  today: string = new Date().toISOString().split('T')[0];
  statusOptions = [CandidatureStatus.PENDING];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCandidatureDialogComponent>,
    private candidatureService: CandidatureService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { internship: any, candidature?: Candidature }
  ) {
    this.candidatureForm = this.fb.group({
      motivationLetter: [data?.candidature?.motivationLetter || '', [Validators.required, Validators.minLength(100)]],
      status: [{ value: CandidatureStatus.PENDING, disabled: true }],
      applicationDate: [{ value: this.today, disabled: true }],
      expirationDate: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.candidatureForm.valid) {
      this.isSubmitting = true;
      const buildCandidature = (cvUrl?: string): Candidature => ({
        motivationLetter: this.candidatureForm.get('motivationLetter')?.value,
        status: CandidatureStatus.PENDING,
        applicationDate: this.data?.candidature?.applicationDate || new Date(this.today),
        expirationDate: this.candidatureForm.get('expirationDate')?.value ? new Date(this.candidatureForm.get('expirationDate')?.value) : undefined,
        cvUrl: cvUrl || this.data?.candidature?.cvUrl,
        internship: this.data.internship ? { idInternship: this.data.internship.idInternship } : undefined
      });

      const handleResponse = (successMsg: string) => ({
        next: () => {
          this.snackBar.open(successMsg, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open('Error saving candidature', 'Close', { duration: 3000 });
          console.error('Error saving candidature:', error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });

      const isEdit = !!this.data?.candidature?.id;
      const candidatureId = this.data?.candidature?.id;

      if (this.selectedFile) {
        this.candidatureService.uploadFile(this.selectedFile).subscribe({
          next: (response) => {
            const candidature = buildCandidature(response.fileUrl);
            if (isEdit && candidatureId) {
              this.candidatureService.updateCandidature(candidatureId, candidature).subscribe(handleResponse('Candidature updated successfully'));
            } else {
              this.candidatureService.addCandidature(candidature).subscribe(handleResponse('Candidature created successfully'));
            }
          },
          error: (error) => {
            this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
            console.error('Error uploading file:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        const candidature = buildCandidature();
        if (isEdit && candidatureId) {
          this.candidatureService.updateCandidature(candidatureId, candidature).subscribe(handleResponse('Candidature updated successfully'));
        } else {
          this.candidatureService.addCandidature(candidature).subscribe(handleResponse('Candidature created successfully'));
        }
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 