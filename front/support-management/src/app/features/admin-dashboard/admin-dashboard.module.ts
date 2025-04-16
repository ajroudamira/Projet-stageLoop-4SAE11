import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { LayoutModule } from '../../layout/layout.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ReportsComponent } from './reports/reports.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { TicketManagementComponent } from './ticket-management/ticket-management.component';
import { TicketDetailComponent } from './ticket-management/ticket-detail/ticket-detail.component';
import { UserFormComponent } from './user-management/user-form/user-form.component';
import { NotificationManagementComponent } from './notification-management/notification-management.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketManagerComponent } from './ticket-management/ticket-manager/ticket-manager.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthService, AUTH_SERVICE_TOKEN } from '../../core/services/auth.service';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    UserManagementComponent,
    ReportsComponent,
    DashboardOverviewComponent,
    TicketManagementComponent,
    TicketDetailComponent,
    UserFormComponent,
    NotificationManagementComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgChartsModule,
    AdminDashboardRoutingModule,
    LayoutModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      timeOut: 3000
    }),
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    // Standalone Components
    TicketManagerComponent,
    SharedModule
  ],
  providers: [
    { provide: AUTH_SERVICE_TOKEN, useClass: AuthService }
  ]
})
export class AdminDashboardModule { } 