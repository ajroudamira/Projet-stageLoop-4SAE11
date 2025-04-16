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
export class RoleGuard {
  
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.checkAccess(route);
  }

  private async checkAccess(route: ActivatedRouteSnapshot): Promise<boolean> {
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if the user is logged in
    if (!await this.keycloakService.isLoggedIn()) {
      this.router.navigate(['/']);
      return false;
    }

    // Get user roles
    const userRoles = await this.keycloakService.getUserRoles();
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      console.warn('User does not have required roles:', requiredRoles);
      this.router.navigate(['/']);
      return false;
    }
    
    return true;
  }
} 