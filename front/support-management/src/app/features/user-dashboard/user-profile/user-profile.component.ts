import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isUpdatingProfile = false;
  profileUpdateSuccess = false;
  profileUpdateError = '';

  constructor(
    private userProfileService: UserProfileService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      num_tel: [''],
      login: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.initProfileForm(user);
      }
    });
  }

  initProfileForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      num_tel: user.num_tel || '',
      login: user.login
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isUpdatingProfile = true;
    this.profileUpdateSuccess = false;
    this.profileUpdateError = '';

    if (!this.currentUser) {
      this.profileUpdateError = 'User information not available';
      this.isUpdatingProfile = false;
      return;
    }

    const updatedUser: User = {
      ...this.currentUser,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      num_tel: this.profileForm.value.num_tel
    };

    // Ensure the role remains unchanged
    updatedUser.role = this.currentUser.role;

    const userWrapper = {
      user: updatedUser
    };

    this.userProfileService.updateProfile(userWrapper).subscribe(
      response => {
        if (response.success) {
          this.profileUpdateSuccess = true;
          // Update the current user in the service
          if (response.data && response.data.user) {
            this.currentUser = response.data.user;
          } else if (response.data) {
            this.currentUser = response.data;
          }
        } else {
          this.profileUpdateError = response.message || 'Failed to update profile';
        }
        this.isUpdatingProfile = false;
      },
      error => {
        console.error('Error updating profile:', error);
        this.profileUpdateError = 'An error occurred while updating your profile';
        this.isUpdatingProfile = false;
      }
    );
  }
} 