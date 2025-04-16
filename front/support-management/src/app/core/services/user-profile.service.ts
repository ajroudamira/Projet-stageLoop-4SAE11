import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private loadingProfile = false;

  constructor(
    private keycloakService: KeycloakService,
    private userService: UserService
  ) {
    // Delay profile loading to ensure Keycloak is fully initialized
    setTimeout(() => {
      this.loadUserProfile();
    }, 1000);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  // Helper method to check if user has a user-level role
  public async isUserRole(): Promise<boolean> {
    try {
      const userRoles = await this.keycloakService.getUserRoles();
      return userRoles.includes('user') || userRoles.includes('student') || userRoles.includes('partner');
    } catch (error) {
      console.error('Error checking user roles:', error);
      return false;
    }
  }

  public async loadUserProfile() {
    if (this.loadingProfile) return;
    this.loadingProfile = true;

    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.loadingProfile = false;
        return;
      }

      try {
        const userInfo = await this.keycloakService.loadUserProfile();
        console.log('Keycloak user info:', userInfo);
        
        // Get current user roles from Keycloak
        const userRoles = await this.keycloakService.getUserRoles();
        console.log('Keycloak user roles:', userRoles);
        
        // Check for admin role first, otherwise assign 'user' role
        // This handles student and partner roles which should be treated as normal users in our system
        const isAdmin = userRoles.includes('admin');
        const role = isAdmin ? 'admin' : 'user';

        // Try with email first (more reliable way to identify users)
        if (userInfo.email) {
          this.userService.getUserByEmail(userInfo.email)
            .pipe(
              catchError(error => {
                console.error('Error loading user profile by email:', error);
                if (userInfo.username) {
                  return this.tryUsernameLogin(userInfo.username);
                }
                return of({ success: false, message: 'Failed to load user profile' });
              }),
              switchMap(response => {
                if (response.success && response.data) {
                  return of(response);
                } else if (userInfo.username) {
                  // Try username if email fails
                  return this.tryUsernameLogin(userInfo.username).pipe(
                    switchMap(usernameResponse => {
                      if (usernameResponse.success && usernameResponse.data) {
                        return of(usernameResponse);
                      } else {
                        // Auto-register user if not found by email or username
                        return this.registerKeycloakUser(userInfo, role);
                      }
                    })
                  );
                } else {
                  // Auto-register user if not found by email and no username
                  return this.registerKeycloakUser(userInfo, role);
                }
              })
            )
            .subscribe({
              next: response => {
                if (response.success && response.data) {
                  if (response.data.user) {
                    this.currentUserSubject.next(response.data.user);
                  } else {
                    this.currentUserSubject.next(response.data);
                  }
                } else {
                  console.error('Failed to load or create user profile:', response.message);
                  
                  // Create a fallback user object from Keycloak info
                  const fallbackUser = {
                    id: 0,
                    id_User: 0, // Add id_User field for compatibility with updated User model
                    login: userInfo.username || userInfo.email || 'unknown',
                    email: userInfo.email || '',
                    firstName: userInfo.firstName || '',
                    lastName: userInfo.lastName || '',
                    role: role,
                    keycloakId: userInfo.id || ''
                  };
                  
                  this.currentUserSubject.next(fallbackUser as User);
                  console.log('Using fallback user profile:', fallbackUser);
                }
                this.loadingProfile = false;
              },
              error: (err) => {
                console.error('Unhandled error in user profile loading:', err);
                this.loadingProfile = false;
              }
            });
        } else if (userInfo.username) {
          this.tryUsernameLogin(userInfo.username)
            .pipe(
              switchMap(response => {
                if (response.success && response.data) {
                  return of(response);
                } else {
                  // Auto-register user if not found by username
                  return this.registerKeycloakUser(userInfo, role);
                }
              })
            )
            .subscribe({
              next: response => {
                if (response.success && response.data) {
                  if (response.data.user) {
                    this.currentUserSubject.next(response.data.user);
                  } else {
                    this.currentUserSubject.next(response.data);
                  }
                } else {
                  // Create a fallback user from Keycloak info
                  const fallbackUser = {
                    id: 0,
                    id_User: 0, // Add id_User field for compatibility with updated User model
                    login: userInfo.username || 'unknown',
                    email: userInfo.email || '',
                    firstName: userInfo.firstName || '',
                    lastName: userInfo.lastName || '',
                    role: role,
                    keycloakId: userInfo.id || ''
                  };
                  
                  this.currentUserSubject.next(fallbackUser as User);
                  console.log('Using fallback user profile:', fallbackUser);
                }
                this.loadingProfile = false;
              },
              error: (err) => {
                console.error('Unhandled error in user profile loading:', err);
                this.loadingProfile = false;
              }
            });
        } else {
          console.error('No email or username available in Keycloak profile');
          this.loadingProfile = false;
        }
      } catch (keycloakError) {
        console.error('Error getting user info from Keycloak:', keycloakError);
        this.loadingProfile = false;
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.loadingProfile = false;
    }
  }

  private tryUsernameLogin(username: string): Observable<any> {
    return this.userService.getUserByUsername(username)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            console.log('User found by username:', response.data);
          } else {
            console.log('User not found in database by username:', username);
          }
        }),
        catchError(error => {
          console.error('Error loading user profile by username:', error);
          return of({ success: false, message: 'Failed to load user profile by username' });
        })
      );
  }

  private registerKeycloakUser(userInfo: any, role: string): Observable<any> {
    console.log('Attempting to register user from Keycloak profile:', userInfo);
    
    // Create user object from Keycloak info
    const user: any = {
      login: userInfo.username || userInfo.email || 'unknown',
      email: userInfo.email || '',
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      role: role,
      keycloakId: userInfo.id || '' // Use id instead of sub
    };
    
    const userWrapper = {
      user: user,
      keycloakUser: {
        username: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: true,
        emailVerified: true
      }
    };

    // If the backend fails to create a user (e.g., due to permissions),
    // return a successful response with a temporary user object
    return this.userService.createUser(userWrapper).pipe(
      tap(response => {
        if (response.success) {
          console.log('User successfully registered from Keycloak:', response.data);
        } else {
          console.error('Failed to register user from Keycloak:', response.message);
        }
      }),
      catchError(error => {
        console.error('Error registering user from Keycloak:', error);
        // Return a successful response with the user data to allow the app to continue
        return of({ 
          success: true, 
          message: 'Using temporary user profile due to backend error', 
          data: { 
            user: {
              ...user,
              id: 0,  // Temporary ID
              tempUser: true // Mark as temporary
            }
          } 
        });
      })
    );
  }

  public updateProfile(userWrapper: any): Observable<any> {
    return this.userService.updateUser(userWrapper).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
        }
      }),
      catchError(error => {
        console.error('Error updating user profile:', error);
        return of({ success: false, message: 'Failed to update profile' });
      })
    );
  }

  public logout() {
    this.currentUserSubject.next(null);
    this.keycloakService.logout();
  }

  /**
   * Gets the current user data for use in API requests.
   * Returns a user object with at least an ID property.
   */
  public getCurrentUser(): User | { id: number } {
    const currentUser = this.currentUserSubject.value;
    
    if (currentUser) {
      // Return a simplified user object with just the ID for API requests
      return { 
        id: currentUser.id_User || 0 
      };
    }
    
    // Return a default user if no user is logged in (fallback)
    return { id: 1 }; // Default admin ID
  }
} 