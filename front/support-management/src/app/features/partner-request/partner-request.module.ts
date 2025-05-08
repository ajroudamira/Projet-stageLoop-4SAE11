import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MyPartnerRequestsComponent } from './my-partner-requests.component';
import { AdminPartnerRequestsComponent } from './admin-partner-requests.component';

@NgModule({
  declarations: [
    MyPartnerRequestsComponent,
    AdminPartnerRequestsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  exports: [
    MyPartnerRequestsComponent,
    AdminPartnerRequestsComponent
  ]
})
export class PartnerRequestModule {} 