import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading = true;
  isSyncing = false;
  isDeleting = false;
  error = '';
  syncMessage = '';
  deleteMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        console.log('User API response:', response);
        
        // Check if response is an array (direct data return)
        if (Array.isArray(response)) {
          this.users = response as User[];
          console.log('Loaded users from array:', this.users);
        } 
        // Check if response has the expected wrapper format
        else if (
          response && 
          typeof response === 'object' && 
          'success' in response && 
          response.success && 
          response.data
        ) {
          this.users = response.data as User[];
          console.log('Loaded users from wrapped response:', this.users);
        } 
        // Handle error case
        else {
          this.error = 'Failed to load users: ' + (this.getErrorMessage(response) || 'Unknown error');
          this.users = [];
          console.error('Failed to load users:', response);
        }
        
        // Initialize filtered users
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => 
      (user.login && user.login.toLowerCase().includes(searchTermLower)) ||
      (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTermLower)) ||
      (user.role && user.role.toLowerCase().includes(searchTermLower)) ||
      (user.id_User && user.id_User.toString().includes(searchTermLower))
    );
  }

  syncUsersFromKeycloak(): void {
    this.isSyncing = true;
    this.syncMessage = '';
    this.error = '';
    
    this.userService.syncUsersFromKeycloak().subscribe({
      next: (response: any) => {
        console.log('Sync response:', response);
        if (
          response && 
          typeof response === 'object' && 
          'success' in response && 
          response.success
        ) {
          this.syncMessage = `Successfully synced ${response.data ? response.data.length : 0} users from Keycloak`;
          // Reload users after sync
          this.loadUsers();
        } else {
          this.error = 'Failed to sync users from Keycloak: ' + (this.getErrorMessage(response) || 'Unknown error');
        }
        this.isSyncing = false;
      },
      error: error => {
        console.error('Error syncing users from Keycloak:', error);
        this.error = 'Failed to sync users from Keycloak. Please try again.';
        this.isSyncing = false;
      }
    });
  }

  deleteUser(username: string): void {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
      this.isDeleting = true;
      this.error = '';
      this.deleteMessage = '';
      
      // Find the full user object from the username
      const userToDelete = this.users.find(u => u.login === username);
      console.log('User to delete:', userToDelete);
      if (userToDelete) {
        
        this.deleteUserByUsername(username);
      }

    }
  }
  
  private deleteUserById(userId: string): void {
    // Use the same endpoint format that works for username-based deletion
    this.http.delete(`http://localhost:9090/api/service/user/DeleteUser/${userId}`)
      .subscribe({
        next: (response: any) => {
          console.log('Delete by ID response:', response);
          this.handleDeleteSuccess(response);
        },
        error: (error) => {
          console.error('Error deleting user by ID:', error);
          // Fall back to regular delete if this fails
          this.deleteUserByUsername(this.getUsernameForId(userId));
        }
      });
  }
  
  private deleteUserByUsername(username: string): void {
    this.userService.deleteUser(username).subscribe({
      next: (response: any) => {
        console.log('Delete response:', response);
        this.loadUsers();
        this.handleDeleteSuccess(response, username);
      },
      error: error => {
        console.error('Error deleting user:', error);
        this.error = 'Failed to delete user. Please try again.';
        this.isDeleting = false;
      }
    });
  }
  
  private handleDeleteSuccess(response: any, username?: string): void {
    // Check if response indicates success
    if (this.isSuccessResponse(response)) {
      this.deleteMessage = `Successfully deleted user ${username || ''}`;
      // Remove user from the list - if we have a username, filter by that
      if (username) {
        this.users = this.users.filter(user => user.login !== username);
      }
      // If we don't have a username, reload the users
      else {
        this.loadUsers();
      }
      
      // Update filtered users as well
      this.applyFilter();
    } else {
      this.error = 'Failed to delete user: ' + (this.getErrorMessage(response) || 'Unknown error');
    }
    this.isDeleting = false;
  }
  
  private getUsernameForId(userId: string): string {
    // Find user by ID - add a null check for id_User before calling toString()
    const user = this.users.find(u => u.id_User !== undefined && u.id_User.toString() === userId);
    return user ? user.login : '';
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

  navigateToAddUser(): void {
    this.router.navigate(['/admin/users/add']);
  }

  navigateToEditUser(user: User): void {
    console.log('Navigating to edit user:', user);
    
    // The backend uses id_User 
    if (!user) {
      console.error('Cannot navigate to edit user - user is undefined');
      this.error = 'Cannot edit user: User is missing';
      return;
    }
    
    if (!user.id_User) {
      console.error('Cannot navigate to edit user - id_User is not defined', user);
      this.error = 'Cannot edit user: User ID is missing';
      return;
    }
    
    console.log('Using ID for navigation:', user.id_User);
    this.router.navigate(['/admin/users/edit', user.id_User]);
  }
} 