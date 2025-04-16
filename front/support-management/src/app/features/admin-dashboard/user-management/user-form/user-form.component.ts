import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { catchError, of, tap, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Interface for the wrapper structure needed by the API
interface UserWrapper {
  keycloakUser?: any;
  user: User;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  userEmail: string | null = null;
  currentUser: User | null = null;
  userWrapper: any = null;
  isLoading = false;
  isSubmitting = false;
  error = '';
  successMessage = '';
  availableRoles = ['user', 'admin', 'student', 'partner'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = id;
      console.log('Loading user with ID:', id);
      
      // Make password optional in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators(Validators.minLength(8)); // Only validate length if entered
      this.userForm.get('password')?.updateValueAndValidity();
      
      // Try multiple strategies to load user data
      this.loadUserData(id);
    }
  }

  loadUserData(idOrUsername: string): void {
    this.isLoading = true;
    this.error = '';
    console.log('Fetching user data for:', idOrUsername);
    
    // Always start with getAllUsers() as it's most reliable
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('All users response:', response);
        
        if (response && response.success && Array.isArray(response.data)) {
          // Try to find user by ID first (most reliable approach)
          const foundUser = response.data.find(u => 
            u.id_User?.toString() === idOrUsername || 
            u.login === idOrUsername
          );
          
          if (foundUser) {
            console.log('Found user in getAllUsers:', foundUser);
            // Create a wrapper structure like the working example
            this.userWrapper = {
              user: foundUser,
              keycloakUser: null
            };
            
            this.currentUser = foundUser;
            this.userEmail = foundUser.email;
            
            if (this.currentUser) {
              this.patchUserFormValues(this.currentUser);
              this.isLoading = false;
              return;
            }
          } else {
            console.log('User not found in getAllUsers response. Available users:', response.data);
          }
        }
        
        // If still here, we didn't find the user in getAllUsers
        // Try the approach from the working example: getUserByEmail
        console.log('User not found in getAllUsers, checking alternative methods');
        this.tryAlternativeMethods(idOrUsername);
      },
      error: (error) => {
        console.error('Error fetching all users:', error);
        this.tryAlternativeMethods(idOrUsername);
      }
    });
  }
  
  private tryAlternativeMethods(idOrUsername: string): void {
    // We'll try the same approach as the working example
    if (this.userEmail) {
      console.log('Trying to get user by email:', this.userEmail);
      this.userService.getUserByEmail(this.userEmail).subscribe({
        next: (response) => {
          console.log('User by email response:', response);
          this.handleApiResponse(response);
        },
        error: (emailError) => {
          console.error('Error fetching user by email:', emailError);
          this.lastResortMethodsForLoading(idOrUsername);
        }
      });
    } else {
      this.lastResortMethodsForLoading(idOrUsername);
    }
  }

  private lastResortMethodsForLoading(idOrUsername: string): void {
    console.log('Using last resort approach - creating skeleton user for edit mode');
    
    // Create a minimal user object with just the ID
    // This approach matches the working example for edit mode
    const tempUser: User = {
      id_User: parseInt(idOrUsername),
      login: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'user'
    };
    
    this.currentUser = tempUser;
    this.userWrapper = { user: tempUser };
    
    // Don't make any additional API calls as they're causing 404 errors
    this.isLoading = false;
    
    // No error message - we'll let the user fill in the form
    // This matches the approach in the working example
    console.log('Form ready for data entry with ID:', idOrUsername);
  }
  
  loadUserByEmail(email: string): void {
    console.log('Trying to load user by email:', email);
    
    this.userService.getUserByEmail(email).subscribe({
      next: (response) => this.handleApiResponse(response),
      error: (error) => {
        console.error('Error loading user by email:', error);
        this.error = 'Failed to load user data. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  private handleApiResponse(response: any): void {
    console.log('Handling API response:', response);
    
    if (response?.success && response?.data) {
      // Handle nested structure if present (like in the working example)
      if (response.data.user) {
        this.userWrapper = response.data;
        this.currentUser = response.data.user;
      } else {
        this.userWrapper = { user: response.data };
        this.currentUser = response.data;
      }
      
      if (this.currentUser) {
        this.patchUserFormValues(this.currentUser);
      } else {
        this.error = 'Failed to load user data: Invalid user data format';
      }
    } else {
      this.error = 'Failed to load user data: User not found';
    }
    
    this.isLoading = false;
  }
  
  tryAlternativeLoadMethods(idOrUsername: string): void {
    this.lastResortMethodsForLoading(idOrUsername);
  }

  private processUserResponse(response: any): void {
    this.handleApiResponse(response);
  }

  private patchUserFormValues(user: User): void {
    if (!user) {
      console.warn('Attempted to patch form values with null user');
      return;
    }
    
    console.log('Patching form with user data:', user);
    
    this.userForm.patchValue({
      login: user.login || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    
    // Disable username field in edit mode
    if (this.isEditMode) {
      this.userForm.get('login')?.disable();
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';

    // Get form values
    const formValues = this.userForm.getRawValue();
    
    if (this.isEditMode) {
      // Create a wrapper object similarly to the working implementation
      const userWrapper: UserWrapper = {
        user: {
          ...(this.currentUser || {}), // Keep existing user data (including id_User)
          login: formValues.login,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          role: formValues.role,
          // Keep the ID when updating
          id_User: this.currentUser?.id_User || 0,
          // Include password if provided (for both create and update)
          ...(formValues.password ? { password: formValues.password } : {})
        }
      };
      
      // For edit mode, add keycloak user data
      userWrapper.keycloakUser = {
        username: formValues.login,
        enabled: true,
        email: formValues.email,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        attributes: [],
        realmRoles: [formValues.role]
      };
      
      console.log('Submitting user data for update:', userWrapper);

      this.userService.updateUser(userWrapper).subscribe({
        next: (response: any) => {
          console.log('Update user response:', response);
          
          // Check different success response formats
          if (this.isSuccessResponse(response)) {
            this.successMessage = 'User updated successfully';
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.error = 'Failed to update user: ' + (this.getErrorMessage(response) || 'Unknown error');
          }
          this.isSubmitting = false;
        },
        error: error => {
          console.error('Error updating user:', error);
          this.error = 'Failed to update user. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // New user - Create a user object
      const newUser: User = {
        login: formValues.login,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        role: formValues.role
      };
      
      console.log('Creating new user with Keycloak integration:', newUser);
      
      // Use the new method that handles Keycloak integration
      this.userService.addUserWithKeycloak(newUser, formValues.password).subscribe({
        next: (response: any) => {
          console.log('Create user response:', response);
          
          // Check different success response formats
          if (this.isSuccessResponse(response)) {
            this.successMessage = 'User created successfully';
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.error = 'Failed to create user: ' + (this.getErrorMessage(response) || 'Unknown error');
          }
          this.isSubmitting = false;
        },
        error: error => {
          console.error('Error creating user:', error);
          this.error = 'Failed to create user. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  private isSuccessResponse(response: any): boolean {
    if (response === true || response === 'success' || response === 'OK') {
      return true;
    }
    
    if (typeof response === 'object' && response !== null) {
      if ('success' in response && response.success === true) {
        return true;
      }
    }
    
    return false;
  }

  private getErrorMessage(response: any): string | undefined {
    if (typeof response === 'object' && response !== null && 'message' in response) {
      return response.message;
    }
    return undefined;
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
