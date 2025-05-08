import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

import { LayoutModule } from '../../layout/layout.module';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LoginHistoryComponent } from './login-history/login-history.component';
import { LayoutWithRouterComponent } from '../../layout/layout-with-router/layout-with-router.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutWithRouterComponent,
    children: [
      {
        path: '',
        component: UserDashboardComponent
      },
      {
        path: 'profile',
        component: UserProfileComponent
      },
      {
        path: 'login-history',
        component: LoginHistoryComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    UserDashboardComponent,
    UserProfileComponent,
    LoginHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Material
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    // Custom
    LayoutModule
  ]
})
export class UserDashboardModule { } 