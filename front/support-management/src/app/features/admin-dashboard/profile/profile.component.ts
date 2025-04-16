import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { finalize } from 'rxjs/operators';

interface UserWrapper {
  user: User;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  isSubmitting = false;
  error = '';
  successMessage = '';
  userWrapper: UserWrapper | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      num_tel: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = '';
    
    // Get the current user from UserProfileService
    const user = this.userProfileService.currentUserValue;
    
    if (user) {
      this.currentUser = user;
      this.patchFormValues(user);
      this.isLoading = false;
    } else {
      // If user info is not in the service, subscribe to get it when loaded
      this.userProfileService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            this.patchFormValues(user);
          } else {
            this.error = 'Unable to load user profile';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
          this.error = 'Error loading profile data';
          this.isLoading = false;
        }
      });
    }
  }

  patchFormValues(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      num_tel: user.num_tel || ''
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';

    const formValues = this.profileForm.value;
    
    if (!this.currentUser) {
      this.error = 'User data not available';
      this.isSubmitting = false;
      return;
    }
    
    // Create user object with updated values
    const updatedUser: User = {
      ...this.currentUser,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      num_tel: formValues.num_tel
    };
    
    // Create wrapper as expected by API
    const userWrapper = {
      user: updatedUser
    };
    
    this.userService.updateUser(userWrapper)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.successMessage = 'Profile updated successfully';
            // Update user in the profile service
            if (response.data) {
              this.currentUser = response.data;
              // Update the user in the service
              this.userProfileService.loadUserProfile();
            }
          } else {
            this.error = response.message || 'Error updating profile';
          }
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.error = 'Error updating profile. Please try again.';
        }
      });
  }
}
