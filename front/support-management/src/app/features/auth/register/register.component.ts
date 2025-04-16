import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  isLoading = false;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) { }

  async register() {
    this.isLoading = true;
    
    try {
      // Redirect to Keycloak registration page
      await this.keycloakService.register({
        redirectUri: window.location.origin + '/login'
      });
    } catch (error) {
      console.error('Registration error:', error);
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
} 