import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { NavbarComponent } from './navbar/navbar.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { LayoutWithRouterComponent } from './layout-with-router/layout-with-router.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    NavbarComponent,
    MainLayoutComponent,
    LayoutWithRouterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  exports: [
    NavbarComponent,
    MainLayoutComponent,
    LayoutWithRouterComponent
  ]
})
export class LayoutModule { } 