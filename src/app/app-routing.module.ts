import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormationListComponent } from './components/formation-list/formation-list.component';
import { EventListComponent } from './components/event-list/event-list.component';


const routes: Routes = [
  { path: 'formations', component: FormationListComponent },
  { path: '', redirectTo: '/formations', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: '', redirectTo: '/events', pathMatch: 'full' },  // Redirection vers la liste des événements par défaut
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
