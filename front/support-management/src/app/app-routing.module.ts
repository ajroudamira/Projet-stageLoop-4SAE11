import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { HomeComponent } from './home/home.component';
import { StudentCandidatureComponent } from './features/candidature/student-candidature/student-candidature.component';
import { AdminCandidatureComponent } from './features/candidature/admin-candidature/admin-candidature.component';
import { LayoutWithRouterComponent } from './layout/layout-with-router/layout-with-router.component';
import { InternshipListComponent } from './features/internships/internship-list/internship-list.component';
import { InternshipFormComponent } from './features/internships/internship-form/internship-form.component';
import { PartnerCandidatureComponent } from './features/candidature/partner-candidature/partner-candidature.component';
import { MyPartnerRequestsComponent } from './features/partner-request/my-partner-requests.component';
import { AdminPartnerRequestsComponent } from './features/partner-request/admin-partner-requests.component';
import { RoleUpgradeComponent } from './features/role-upgrade/role-upgrade.component';
import { AdminStudentRequestsComponent } from './features/student-request/admin-student-requests.component';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user-dashboard/user-dashboard.module').then(m => m.UserDashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['admin']
    }
  },
  {
    path: 'tickets',
    loadChildren: () => import('./features/tickets/tickets.module').then(m => m.TicketsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'student/candidatures',
    component: LayoutWithRouterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['student'] },
    children: [
      { path: '', component: StudentCandidatureComponent }
    ]
  },
  {
    path: 'admin/candidatures',
    component: LayoutWithRouterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', component: AdminCandidatureComponent }
    ]
  },
  {
    path: 'partner/candidatures',
    component: LayoutWithRouterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['partner'] },
    children: [
      { path: '', component: PartnerCandidatureComponent }
    ]
  },
  {
    path: '',
    component: LayoutWithRouterComponent,
    children: [
      {
        path: 'internships',
        canActivate: [AuthGuard],
        children: [
          { path: '', component: InternshipListComponent },
          { path: 'create', component: InternshipFormComponent },
          { path: ':id', component: InternshipFormComponent },
          { path: ':id/view', component: InternshipFormComponent, data: { readOnly: true } }
        ]
      },
      { path: 'my-partner-requests', component: MyPartnerRequestsComponent, canActivate: [AuthGuard], data: { roles: ['user', 'student', 'partner'] } },
      { path: 'role-upgrade', component: RoleUpgradeComponent, canActivate: [AuthGuard], data: { roles: ['user'] } },
      { path: 'admin/partner-requests', component: AdminPartnerRequestsComponent, canActivate: [AuthGuard], data: { roles: ['admin'] } },
      { path: 'admin/student-requests', component: AdminStudentRequestsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 