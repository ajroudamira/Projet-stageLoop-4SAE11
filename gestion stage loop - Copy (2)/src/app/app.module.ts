import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormationListComponent } from './components/formation-list/formation-list.component';
import { FormationFormComponent } from './components/formation-form/formation-form.component';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { MatChipsModule } from '@angular/material/chips';
import { CreateEvaluationComponent } from './components/create-evaluation/create-evaluation.component';
import { AfficherEvaluationComponent } from './components/afficher-evaluation/afficher-evaluation.component';
import { AfficherModerationComponent } from './components/afficher-moderation/afficher-moderation.component';
import { CreateModerationComponent } from './components/create-moderation/create-moderation.component';
import { ModerationService } from './services/moderationApi';
import { TransportFeeComponent } from './components/transport-fee/transport-fee.component'; // Ajout du service

@NgModule({
  declarations: [
    AppComponent,
    FormationListComponent,
    FormationFormComponent,
    EventListComponent,
    EventFormComponent,
    CreateEvaluationComponent,
    AfficherEvaluationComponent,
    AfficherModerationComponent,
    CreateModerationComponent,
    TransportFeeComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatChipsModule
  ],
  providers: [ModerationService], // Ajout du service ici
  bootstrap: [AppComponent]
})
export class AppModule { }
