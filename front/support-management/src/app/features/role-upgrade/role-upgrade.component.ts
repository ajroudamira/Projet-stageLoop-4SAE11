import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from '../../core/services/user-profile.service';
import { User } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { PartnerRequestService, PartnerRequest } from '../../core/services/partner-request.service';
import { StudentRequestService } from 'src/app/core/services/student-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentRequest } from 'src/app/core/services/student-request.service';
import { MatDialog } from '@angular/material/dialog';
import { PartnerRequestModalComponent } from './partner-request-modal.component';

@Component({
  selector: 'app-role-upgrade',
  templateUrl: './role-upgrade.component.html',
  styleUrls: ['./role-upgrade.component.scss']
})
export class RoleUpgradeComponent implements OnInit {
  roleUpgradeForm: FormGroup;
  isSubmitting = false;
  selectedRole: 'student' | 'partner' | null = null;
  currentUser: User | null = null;
  hasPendingRequest = false;
  isLoading = false;
  isUserRole = false;
  hasPendingPartnerRequest = false;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private partnerRequestService: PartnerRequestService,
    private studentRequestService: StudentRequestService,
    private router: Router,
    private toastr: ToastrService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.roleUpgradeForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      businessSector: ['', Validators.required],
      companySize: ['', Validators.required],
      yearsInBusiness: ['', [Validators.required, Validators.min(0)]],
      businessEmail: ['', [Validators.required, Validators.email]],
      businessPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      businessAddress: ['', Validators.required],
      companyDescription: ['', [Validators.required, Validators.minLength(50)]],
      website: [''],
      linkedinProfile: [''],
      internshipPositions: ['', [Validators.required, Validators.min(1)]],
      internshipTypes: ['', Validators.required],
      motivation: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.isUserRole = !!user && user.role === 'user';
      if (this.currentUser) {
        this.studentRequestService.getUserRequests(this.currentUser).subscribe(requests => {
          this.hasPendingRequest = requests.some(req => req.status === 'PENDING');
        });
      }
    });
    this.partnerRequestService.getMyRequests().subscribe(requests => {
      this.hasPendingPartnerRequest = requests.some(req => req.status === 'PENDING');
    });
    this.checkExistingRequests();
  }

  private checkExistingRequests(): void {
    if (this.currentUser) {
      this.studentRequestService.getUserRequests(this.currentUser).subscribe(
        (requests: StudentRequest[]) => {
          this.hasPendingRequest = requests.some((req: StudentRequest) => req.status === 'PENDING');
        },
        (error: any) => {
          console.error('Error checking existing requests:', error);
        }
      );
    }
  }

  selectRole(role: 'student' | 'partner'): void {
    this.selectedRole = role;
    // Do not auto-submit here
  }

  onRequestUpgrade(): void {
    if (this.selectedRole === 'student') {
      this.upgradeToStudent();
    } else if (this.selectedRole === 'partner' && this.currentUser) {
      const dialogRef = this.dialog.open(PartnerRequestModalComponent, {
        width: '600px',
        data: { userId: this.currentUser.id_User }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Partner request submitted successfully', 'Close', { duration: 3000 });
          this.hasPendingPartnerRequest = true;
        }
      });
    }
  }

  upgradeToStudent(): void {
    if (!this.currentUser) {
      this.snackBar.open('User information not available', 'Close', { duration: 3000 });
      return;
    }

    if (this.hasPendingRequest) {
      this.snackBar.open('You already have a pending student request', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.studentRequestService.submitStudentRequest({
      status: 'PENDING'
    }).subscribe({
      next: () => {
        this.snackBar.open('Student upgrade request submitted successfully', 'Close', { duration: 3000 });
        this.hasPendingRequest = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting request:', error);
        this.snackBar.open('Failed to submit request. Please try again.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  submitPartnerRequest(): void {
    if (this.roleUpgradeForm.invalid || !this.currentUser) return;

    this.isSubmitting = true;
    const formData = this.roleUpgradeForm.value;

    const partnerRequest: PartnerRequest = {
      userId: this.currentUser.id_User,
      ...formData,
      status: 'PENDING'
    };

    this.partnerRequestService.submitPartnerRequest(partnerRequest).subscribe({
      next: (response: PartnerRequest) => {
        this.toastr.success('Partner request submitted successfully');
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error('Error submitting partner request:', error);
        this.toastr.error('Failed to submit partner request');
        this.isSubmitting = false;
      }
    });
  }
} 