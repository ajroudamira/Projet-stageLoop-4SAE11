import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { TicketManagementComponent } from './ticket-management/ticket-management.component';
import { TicketDetailComponent } from './ticket-management/ticket-detail/ticket-detail.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserFormComponent } from './user-management/user-form/user-form.component';
import { ReportsComponent } from './reports/reports.component';
import { NotificationManagementComponent } from './notification-management/notification-management.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { ProfileComponent } from './profile/profile.component';
import { TicketManagerComponent } from './ticket-management/ticket-manager/ticket-manager.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['admin'] 
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: DashboardOverviewComponent
      },
      {
        path: 'tickets',
        component: TicketManagementComponent
      },
      {
        path: 'tickets/:id',
        component: TicketDetailComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'users/add',
        component: UserFormComponent
      },
      {
        path: 'users/edit/:id',
        component: UserFormComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'notifications',
        component: NotificationManagementComponent
      },
      {
        path: 'ticket-manager',
        component: TicketManagerComponent,
        data: {
          roles: ['admin']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule { } 