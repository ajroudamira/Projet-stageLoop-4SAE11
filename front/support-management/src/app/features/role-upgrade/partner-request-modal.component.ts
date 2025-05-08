import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PartnerRequestService, PartnerRequest } from 'src/app/core/services/partner-request.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-partner-request-modal',
  templateUrl: './partner-request-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class PartnerRequestModalComponent implements OnInit {
  partnerForm: FormGroup;
  isSubmitting = false;
  hasPendingRequest = false;

  constructor(
    private fb: FormBuilder,
    private partnerRequestService: PartnerRequestService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<PartnerRequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.partnerForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      businessSector: ['', Validators.required],
      companySize: ['', Validators.required],
      yearsInBusiness: ['', [Validators.required, Validators.min(0)]],
      businessEmail: ['', [Validators.required, Validators.email]],
      businessPhone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      businessAddress: ['', Validators.required],
      companyDescription: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(255)]],
      website: [''],
      linkedinProfile: [''],
      internshipPositions: ['', Validators.required],
      internshipTypes: ['', Validators.required],
      motivation: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.partnerRequestService.getMyRequests().subscribe(
      (requests: PartnerRequest[]) => {
        this.hasPendingRequest = requests.some(req => req.status === 'PENDING');
      },
      () => { this.hasPendingRequest = false; }
    );
  }

  submit(): void {
    if (this.partnerForm.invalid || this.hasPendingRequest) return;
    this.isSubmitting = true;
    const partnerRequest: PartnerRequest = {
      userId: this.data.userId,
      ...this.partnerForm.value,
      status: 'PENDING'
    };
    this.partnerRequestService.submitPartnerRequest(partnerRequest).subscribe({
      next: () => {
        this.toastr.success('Partner request submitted successfully');
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.toastr.error('Failed to submit partner request');
        this.isSubmitting = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
} 