import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { UserProfileService } from './core/services/user-profile.service';
import { Router, NavigationEnd, NavigationStart, NavigationCancel } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Support Management System';
  isLoggedIn = false;
  isLoading = true;

  constructor(
    private keycloakService: KeycloakService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.keycloakService.isLoggedIn();
    
    if (this.isLoggedIn) {
      await this.userProfileService.loadUserProfile();
    }

    // Handle router events for loading indicator
    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart ||
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else {
        this.isLoading = false;
      }
    });

    // Set the loading to false after 2 seconds (failsafe)
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
} 