import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { CommonModule } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    // Fournisseur du service EventService
    importProvidersFrom(RouterModule),  // Fournisseur pour gérer le routing
    importProvidersFrom(FormsModule, ReactiveFormsModule),  // Fournisseur pour les formulaires
    importProvidersFrom(CommonModule),  // Fournisseur pour les directives communes comme *ngIf et *ngFor
    provideRouter(routes),  // Active le routing avec les routes définies dans app.routes.ts
    provideHttpClient(),    // Fournisseur pour HTTP client pour les appels API
  ]
};