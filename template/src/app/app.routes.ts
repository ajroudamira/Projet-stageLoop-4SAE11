import { Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office/back-office.component';
import { TablesComponent } from './back-office/tables/tables.component';
import { ChartsComponent } from './back-office/charts/charts.component';
import { Error401Component } from './error401/error401.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { RegisterComponent } from './register/register.component';
import { LayoutStaticComponent } from './back-office/layout-static/layout-static.component';
import { LayoutSidenavLightComponent } from './back-office/layout-sidenav-light/layout-sidenav-light.component';
import { HomeComponent } from './home/home.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { CreateEvaluationComponent } from './components/create-evaluation/create-evaluation.component';
import { AfficherEvaluationComponent } from './components/afficher-evaluation/afficher-evaluation.component';
import { AfficherModerationComponent } from './components/afficher-moderation/afficher-moderation.component';
import { CreateModerationComponent } from './components/create-moderation/create-moderation.component';
import { TransportFeeComponent } from './components/transport-fee/transport-fee.component';
import { RouterModule } from '@angular/router';

export const routes: Routes = [
  {path:"back-office", children:[
    {path:"", component:BackOfficeComponent},
    {path:"tables", component:TablesComponent},
    {path:"charts", component:ChartsComponent},
    {path:"layout-static", component:LayoutStaticComponent},
    {path:"layout-sidenav-ligh", component:LayoutSidenavLightComponent},
  ]},
  {path : "home", component:HomeComponent},
  {path : "", redirectTo:"home", pathMatch: 'full'},
  { path: 'fee', component: TransportFeeComponent },
  { path: 'evaluations', component: AfficherEvaluationComponent },
  { path: 'create-moderation', component: CreateModerationComponent },
  { path: 'create-evaluation', component: CreateEvaluationComponent },
  { path: 'moderations', component: AfficherModerationComponent },
  { path: 'afficherevaluations', component: AfficherEvaluationComponent },
  {path:"401", component:Error401Component},
  {path:"404", component:Error404Component},
  {path:"500", component:Error500Component},
  {path:"login", component:LoginComponent},
  {path:"password", component:PasswordComponent},
  {path:"register", component:RegisterComponent},
  {path:"register", component:RegisterComponent},
  {path:"register", component:RegisterComponent},
  {path: '**', component: Error404Component },
];
