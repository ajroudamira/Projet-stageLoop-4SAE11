import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, mergeMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private path = '/user';

  constructor(private apiService: ApiService) {}

  getAllUsers(): Observable<ApiResponse<User[]>> {
    console.log('Getting all users from API...');
    
    return this.apiService.get<User[]>(`${this.path}/GetAllUsers`).pipe(
      catchError(error => {
        console.log('Error getting users from GetAllUsers, trying lowercase endpoint...');
        return this.apiService.get<User[]>(`${this.path}/getAllUsers`).pipe(
          catchError(error2 => {
            console.log('Error getting users from getAllUsers, trying /all endpoint...');
            return this.apiService.get<User[]>(`${this.path}/all`).pipe(
              catchError(error3 => {
                console.log('All user endpoints failed, returning empty result');
                return of({ success: false, data: [], message: 'Could not retrieve users from any endpoint' } as ApiResponse<User[]>);
              })
            );
          })
        );
      }),
      map((response: any) => {
        console.log('Got users response:', response);
        
        // If response is already an array, wrap it in ApiResponse format
        if (Array.isArray(response)) {
          console.log(`Found ${response.length} users in array response`);
          
          // Log users with admin role
          const adminUsers = response.filter((user: any) => user.role === 'admin');
          console.log(`Found ${adminUsers.length} admin users:`, adminUsers);
          
          // Convert to ApiResponse format
          return { 
            success: true, 
            data: response as User[], 
            message: 'Users retrieved successfully' 
          } as ApiResponse<User[]>;
        }
        
        // Handle standard ApiResponse format
        if (response && response.success && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} users in the response`);
          
          // Log users with admin role
          const adminUsers = response.data.filter((user: User) => user.role === 'admin');
          console.log(`Found ${adminUsers.length} admin users:`, adminUsers);
          
          return response as ApiResponse<User[]>;
        } 
        
        // If response has data but not in expected format
        if (response && response.data && !Array.isArray(response.data)) {
          try {
            // Try to extract users from non-array data
            const extractedUsers = Array.isArray(Object.values(response.data)) 
              ? Object.values(response.data) 
              : [response.data];
            
            console.log(`Extracted ${extractedUsers.length} users from non-array data`);
            return { 
              success: true, 
              data: extractedUsers as User[], 
              message: 'Users extracted from response' 
            } as ApiResponse<User[]>;
          } catch (e) {
            console.warn('Could not extract users from response data', e);
          }
        }
        
        // If we couldn't process in any other way, return as is
        return response as ApiResponse<User[]>;
      })
    );
  }

  getUserByUsername(username: string): Observable<ApiResponse<any>> {
    console.log(`Attempting to get user by username: ${username}`);
    
    // Try with the default endpoint first
    return this.apiService.get<any>(`${this.path}/GetUserByUserName/${username}`).pipe(
      catchError(error => {
        console.log('GetUserByUserName failed, trying getUserByUserName endpoint (lowercase)');
        // Try lowercase version as fallback
        return this.apiService.get<any>(`${this.path}/getUserByUserName/${username}`).pipe(
          catchError(error2 => {
            console.log('getUserByUserName also failed, trying GetUserById as last resort');
            // Try GetUserById as a last resort (might work if username is an ID)
            return this.apiService.get<any>(`${this.path}/GetUserById/${username}`);
          })
        );
      })
    );
  }

  getUserByEmail(email: string): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/GetUserByEmail/${email}`);
  }

  createUser(userWrapper: any): Observable<ApiResponse<User>> {
    return this.apiService.post<User>(`${this.path}/CreateUser`, userWrapper);
  }

  /**
   * Creates a user both in Keycloak and the backend database
   * @param user Basic user information
   * @param password User's password
   * @param role User's role (admin or user)
   * @param firstName User's first name
   * @param lastName User's last name
   */
  addUserWithKeycloak(user: User, password: string): Observable<ApiResponse<User>> {
    console.log('Creating user with Keycloak integration:', user);
    
    // Create a credential object for Keycloak
    const credential = {
      type: 'password',
      value: password,
      temporary: false
    };
    
    // Set the role (admin, user, student, or partner)
    const selectedRole = user.role || 'user';
    
    // Create a Keycloak user representation
    const keycloakUser = {
      username: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: true,
      emailVerified: true,
      credentials: [credential],
      realmRoles: [selectedRole],
      attributes: {}
    };
    
    // Create a wrapper object as expected by the backend
    const userWrapper = {
      keycloakUser: keycloakUser,
      user: user,
      imageUrl: user.imageUrl || ''
    };
    
    console.log('UserWrapper JSON:', JSON.stringify(userWrapper));
    
    // Call the CreateUser endpoint that will handle both Keycloak and database creation
    return this.apiService.post<User>(`${this.path}/CreateUser`, userWrapper).pipe(
      catchError(error => {
        console.error('Error creating user:', error);
        return of({ 
          success: false, 
          message: 'Failed to create user. ' + (error.message || ''),
          data: null 
        });
      })
    );
  }

  updateUser(userWrapper: any): Observable<ApiResponse<User>> {
    return this.apiService.put<User>(`${this.path}/UpdateUser`, userWrapper);
  }

  deleteUser(username: string): Observable<ApiResponse<void>> {
    console.log(`Attempting to delete user: ${username}`);
    
    // Match the endpoint format from the working frontend
    return this.apiService.delete<void>(`${this.path}/DeleteUser/${username}`);
  }

  syncUsersFromKeycloak(): Observable<ApiResponse<string[]>> {
    console.log('Attempting to sync all users from Keycloak to the database');
    return this.apiService.post<string[]>(`${this.path}/registerAllFromKeycloak`, {}).pipe(
      tap(response => {
        console.log('Keycloak sync response:', response);
        if (response.success) {
          console.log(`Successfully registered ${response.data?.length || 0} users from Keycloak`);
        } else {
          console.warn('Failed to sync users from Keycloak:', response.message);
        }
      }),
      catchError(error => {
        console.error('Error syncing users from Keycloak:', error);
        return of({ success: false, data: [], message: 'Failed to sync users from Keycloak' });
      })
    );
  }

  getProfilePicture(userId: string): Observable<string> {
    return this.apiService.get<string>(`${this.path}/getProfilePicture/${userId}`)
      .pipe(map(response => response.data || ''));
  }

  uploadProfilePicture(userId: number, file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<string>(`${this.path}/uploadProfilePicture/${userId}`, formData);
  }

  // Get user by ID
  getUserById(id: string): Observable<ApiResponse<any>> {
    console.log(`Attempting to get user by ID: ${id}`);
    
    // Try with GetUserById endpoint first
    return this.apiService.get<any>(`${this.path}/GetUserById/${id}`).pipe(
      catchError(error => {
        console.log('GetUserById failed, trying direct path');
        // Try direct path to user/{id}
        return this.apiService.get<any>(`${this.path}/${id}`).pipe(
          catchError(error2 => {
            console.log('Direct path failed too, trying to use GetAllUsers and filter');
            // Try to get all users and filter by ID
            return this.getAllUsers().pipe(
              map(response => {
                // If successful response with data
                if (response.success && response.data && Array.isArray(response.data)) {
                  const foundUser = response.data.find(u => 
                    u.id_User?.toString() === id
                  );
                  
                  if (foundUser) {
                    return { success: true, data: foundUser, message: 'User found by ID' };
                  }
                }
                
                // If direct array returned
                if (Array.isArray(response)) {
                  const foundUser = response.find(u => 
                    u.id_User?.toString() === id
                  );
                  
                  if (foundUser) {
                    return { success: true, data: foundUser, message: 'User found by ID' };
                  }
                }
                
                return { success: false, data: null, message: 'User not found by ID' };
              })
            );
          })
        );
      })
    );
  }

  /**
   * Get all users with admin role
   * @returns Observable of ApiResponse containing array of admin users
   */
  getAdmins(): Observable<ApiResponse<User[]>> {
    console.log('Getting all admin users...');
    
    return this.getAllUsers().pipe(
      map(response => {
        if (response.success && response.data) {
          const admins = response.data.filter(user => user.role === 'admin');
          return {
            success: true,
            data: admins,
            message: `Found ${admins.length} admin users`
          };
        }
        return response;
      })
    );
  }

  getUserLoginHistory(username: string): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`${this.path}/GetUserLoginHistory/${username}`);
  }

  findByIsTicketManager(isTicketManager: boolean): Observable<ApiResponse<User[]>> {
    return this.apiService.get<User[]>(`${this.path}/findByIsTicketManager?isTicketManager=${isTicketManager}`).pipe(
      catchError(error => {
        console.error('Error checking ticket manager status:', error);
        return of({ success: false, message: 'Failed to check ticket manager status', data: [] });
      })
    );
  }
} 