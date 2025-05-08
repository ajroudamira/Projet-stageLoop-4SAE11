import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InternshipService, Internship } from '../../../services/internship.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-internship-form',
  templateUrl: './internship-form.component.html',
  styleUrls: ['./internship-form.component.scss']
})
export class InternshipFormComponent implements OnInit {
  internshipForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  isAdmin = false;
  readOnly = false;

  internshipTypes = [
    'INTERNSHIP',
    'END_OF_STUDIES_PROJECT',
    'RESEARCH',
    'INDUSTRIAL'
  ];
  internshipStatuses = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'COMPLETED'
  ];

  constructor(
    private fb: FormBuilder,
    private internshipService: InternshipService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userProfileService: UserProfileService
  ) {
    this.internshipForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      type: ['', Validators.required],
      requiredSkills: ['', Validators.required],
      status: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.userProfileService.isAdmin();
    this.readOnly = this.route.snapshot.data['readOnly'] === true;
    if (this.readOnly) {
      this.internshipForm.disable();
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadInternship(Number(id));
    }
  }

  loadInternship(id: number): void {
    this.loading = true;
    this.internshipService.getInternshipById(id).subscribe({
      next: (internship) => {
        this.internshipForm.patchValue({
          title: internship.title,
          description: internship.description,
          startDate: new Date(internship.startDate),
          endDate: new Date(internship.endDate),
          type: internship.type,
          requiredSkills: internship.requiredSkills,
          status: internship.status || 'PENDING'
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading internship';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.internshipForm.valid) {
      this.loading = true;
      const internshipData = this.internshipForm.value;
      // Attach partner if the current user is a partner
      const currentUser = this.userProfileService.currentUserValue;
      if (!this.isAdmin && currentUser && currentUser.role === 'partner') {
        internshipData.partner = { id_User: currentUser.id_User };
      }
      const request = this.isEditMode
        ? this.internshipService.updateInternship(Number(this.route.snapshot.paramMap.get('id')), internshipData)
        : this.internshipService.createInternship(internshipData);
      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Internship ${this.isEditMode ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/internships']);
        },
        error: (err) => {
          this.error = `Error ${this.isEditMode ? 'updating' : 'creating'} internship`;
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/internships']);
  }
} 