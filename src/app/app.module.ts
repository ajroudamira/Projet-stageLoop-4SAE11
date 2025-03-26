  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { RouterModule } from '@angular/router';
  import { HttpClientModule } from '@angular/common/http';
  import { CommonModule } from '@angular/common';

  import { routes } from './app.routes';
  import { AppComponent } from './app.component';
  import { EntrepriseListComponent } from './components/entreprise-list/entreprise-list.component';
  import { EntrepriseService } from './services/entreprise.service';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // ✅ Ajout de FormsModule ici
  import { EntrepriseAddComponent } from './components/entreprise-add/entreprise-add.component';
  import { StageAddComponent } from './components/stage-add/stage-add.component';
  import { EntrepriseStatisticsComponent } from './components/entreprise-statistics/entreprise-statistics.component';
  import { StompService } from '@stomp/ng2-stompjs';
  import { WebSocketService } from './services/websocket.service'; // assuming you have this service
  
  import { StageService } from './services/stage.service';

  @NgModule({
    declarations: [
      AppComponent,
      EntrepriseListComponent,
      EntrepriseAddComponent,
      StageAddComponent,
      EntrepriseStatisticsComponent,
    
    ],
    imports: [
      BrowserModule,
      RouterModule.forRoot(routes),
      HttpClientModule,
      FormsModule,  // ✅ Ajout de FormsModule
      ReactiveFormsModule,
      CommonModule,
    ],
    providers: [EntrepriseService],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
