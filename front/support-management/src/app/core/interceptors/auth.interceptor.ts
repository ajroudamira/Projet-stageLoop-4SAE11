import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from, lastValueFrom } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // For API calls to backend, add the auth token
    if (request.url.includes('/api/')) {
      return from(this.addToken(request)).pipe(
        switchMap(authRequest => next.handle(authRequest)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return from(this.handleUnauthorized(request, next));
          } else if (error.status === 403) {
            console.log('Forbidden request - access denied');
            this.router.navigate(['/']);
          }
          
          return throwError(() => error);
        })
      );
    }
    
    // For all other requests, just pass through
    return next.handle(request);
  }

  private async addToken(request: HttpRequest<any>): Promise<HttpRequest<any>> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      
      if (isLoggedIn) {
        const token = await this.keycloakService.getToken();
        return request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error adding token to request', error);
    }
    
    return request;
  }

  private async handleUnauthorized(request: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
    try {
      const refreshed = await this.keycloakService.updateToken(30);
      
      if (refreshed) {
        const authRequest = await this.addToken(request);
        return await lastValueFrom(next.handle(authRequest));
      } else {
        console.log('Token refresh failed, redirecting to login');
        await this.keycloakService.login({
          redirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('Error refreshing token', error);
      await this.keycloakService.login({
        redirectUri: window.location.origin
      });
    }
    
    throw new Error('Authentication required');
  }

  // Helper to check if user has admin role
  private async hasAdminRole(): Promise<boolean> {
    try {
      const roles = await this.keycloakService.getUserRoles();
      return roles.includes('admin');
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  }

  // Helper to check if user has any user-level role (user, student, partner)
  private async hasUserRole(): Promise<boolean> {
    try {
      const roles = await this.keycloakService.getUserRoles();
      return roles.includes('user') || roles.includes('student') || roles.includes('partner');
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  }
} 