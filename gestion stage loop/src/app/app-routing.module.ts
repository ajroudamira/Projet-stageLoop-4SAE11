import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormationListComponent } from './components/formation-list/formation-list.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { CreateEvaluationComponent } from './components/create-evaluation/create-evaluation.component';
import { AfficherEvaluationComponent } from './components/afficher-evaluation/afficher-evaluation.component';
import { AfficherModerationComponent } from './components/afficher-moderation/afficher-moderation.component';
import { CreateModerationComponent } from './components/create-moderation/create-moderation.component';
import { TransportFeeComponent } from './components/transport-fee/transport-fee.component';


const routes: Routes = [
  { path: 'fee', component: TransportFeeComponent },
  { path: 'evaluations', component: AfficherEvaluationComponent },
  { path: 'create-moderation', component: CreateModerationComponent },
  { path: 'create-evaluation', component: CreateEvaluationComponent },
  { path: 'moderations', component: AfficherModerationComponent },
  { path: 'formations', component: FormationListComponent },
  { path: 'afficherevaluations', component: AfficherEvaluationComponent },
  { path: '', redirectTo: '/formations', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: '', redirectTo: '/evaluations', pathMatch: 'full' },  // Redirection vers la liste des événements par défaut
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }
