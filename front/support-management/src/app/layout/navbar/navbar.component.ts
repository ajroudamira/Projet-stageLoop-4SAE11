import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfileService } from '../../core/services/user-profile.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  isPartner = false;
  isUser = false;
  isStudent = false;

  constructor(
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.userProfileService.isAdmin();
      this.isPartner = !!user && user.role === 'partner';
      this.isUser = !!user && user.role === 'user';
      this.isStudent = !!user && user.role === 'student';
    });
  }

  logout(): void {
    this.userProfileService.logout();
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('http://localhost:8080/realms/constructionRealm/protocol/openid-connect/logout?redirect_uri=' + encodeURIComponent(window.location.origin));
    }, 500);
  }

  navigateToDashboard(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  }
} 