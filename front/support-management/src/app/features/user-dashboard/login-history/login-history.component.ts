import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.scss']
})
export class LoginHistoryComponent implements OnInit {
  currentUser: User | null = null;
  loginHistory: any[] = [];
  isLoading = false;
  error = '';
  
  constructor(
    private userService: UserService,
    private userProfileService: UserProfileService
  ) { }

  async ngOnInit() {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.login) {
        this.loadLoginHistory(user.login);
      }
    });
  }

  loadLoginHistory(username: string): void {
    this.isLoading = true;
    this.error = '';
    
    this.userService.getUserLoginHistory(username).subscribe(
      (logins:any) => {
        this.loginHistory = logins
          .sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3)
          .map((event:any) => ({
            timestamp: event.timestamp,
            ip: event.ip, 
            device: event.device || 'Unknown Device', // ✅ NEW: Device Name
            location: event.location || 'Unknown Location', // ✅ NEW: Location (City, Country)
            details: event.details
          }));
          this.isLoading = false;

      },
      (error) => {
        console.error("❌ Failed to load login history", error);
      }
    );
  }

  refreshHistory(): void {
    if (this.currentUser && this.currentUser.login) {
      this.loadLoginHistory(this.currentUser.login);
    }
  }
} 