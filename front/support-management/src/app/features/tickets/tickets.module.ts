import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Custom Components
import { UserTicketsListComponent } from './user-tickets-list/user-tickets-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';

// Layout Module
import { LayoutModule } from '../../layout/layout.module';
import { LayoutWithRouterComponent } from '../../layout/layout-with-router/layout-with-router.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutWithRouterComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: UserTicketsListComponent
      },
      {
        path: 'create',
        component: TicketFormComponent
      },
      {
        path: 'edit/:id',
        component: TicketFormComponent
      },
      {
        path: ':id',
        component: TicketDetailComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    UserTicketsListComponent,
    TicketDetailComponent,
    TicketFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    // Custom
    LayoutModule
  ]
})
export class TicketsModule { } 