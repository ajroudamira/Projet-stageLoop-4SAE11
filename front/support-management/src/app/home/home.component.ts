import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  userProfile: any = null;
  userRoles: string[] = [];
  loading = false;
  error = '';

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('HomeComponent initialized');
    try {
      this.isLoggedIn = await this.keycloakService.isLoggedIn();
      console.log('isAuthenticated:', this.isLoggedIn);
      if (!this.isLoggedIn) {
        // Force login if not authenticated
        await this.keycloakService.login({
          redirectUri: window.location.origin
        });
        return;
      }
      if (this.isLoggedIn) {
        try {
          this.userProfile = await this.keycloakService.loadUserProfile();
          console.log('User profile loaded:', this.userProfile);
          this.userRoles = await this.keycloakService.getUserRoles();
          console.log('User roles:', this.userRoles);
          // Redirect based on role
          if (this.userRoles.includes('admin')) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        } catch (error) {
          console.error('Error loading user roles:', error);
          this.error = 'Failed to load user roles';
        }
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.error = 'Authentication error occurred';
    }
    this.loading = false;
  }

  login(): void {
    console.log('Login initiated');
    this.loading = true;
    this.error = '';
    
    try {
      this.keycloakService.login({
        redirectUri: window.location.origin
      }).catch(error => {
        console.error('Login failed', error);
        this.error = 'Login failed. Please try again.';
        this.loading = false;
      });
    } catch (error) {
      console.error('Login error', error);
      this.error = 'Login error. Please try again.';
      this.loading = false;
    }
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
} 