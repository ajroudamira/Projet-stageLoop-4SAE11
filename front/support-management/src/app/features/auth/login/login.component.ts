import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  constructor(
    private keycloakService: KeycloakService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      
      if (isLoggedIn) {
        await this.userProfileService.loadUserProfile();
        this.redirectToDashboard();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      this.errorMessage = 'Authentication service unavailable. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  async login() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.keycloakService.login({
        redirectUri: window.location.origin + '/user'
      });
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Failed to log in. Please try again.';
      this.isLoading = false;
    }
  }

  private redirectToDashboard() {
    const isAdmin = this.userProfileService.isAdmin();
    this.router.navigate([isAdmin ? '/admin' : '/user']);
  }
} 