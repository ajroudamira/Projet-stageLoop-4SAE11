import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.checkLogin();
  }

  private async checkLogin(): Promise<boolean> {
    // Check if the user is logged in
    if (await this.keycloakService.isLoggedIn()) {
      return true;
    }
    
    // If not logged in, redirect to home and initiate login
    this.router.navigate(['/']);
    await this.keycloakService.login({
      redirectUri: window.location.origin
    });
    
    return false;
  }
} 