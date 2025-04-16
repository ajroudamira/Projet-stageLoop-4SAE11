import { Injectable, InjectionToken } from '@angular/core';
import { User } from '../models/user.model';
import { KeycloakService } from 'keycloak-angular';

export const AUTH_SERVICE_TOKEN = new InjectionToken<AuthService>('AuthService');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(private keycloak: KeycloakService) {}

  setCurrentUser(user: User) {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isTicketManager(): boolean {
    return this.currentUser?.isTicketManager || false;
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }
} 