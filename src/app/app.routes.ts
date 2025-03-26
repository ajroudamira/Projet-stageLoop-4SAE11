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

// 📌 Import du composant pour la liste des entreprises
import { EntrepriseListComponent } from './components/entreprise-list/entreprise-list.component';
import { EntrepriseAddComponent } from './components/entreprise-add/entreprise-add.component';
import { StageAddComponent } from './components/stage-add/stage-add.component';
import { StageListComponent } from './components/stagelist/stage-list.component';
import { EntrepriseStatisticsComponent } from './components/entreprise-statistics/entreprise-statistics.component';

export const routes: Routes = [
  { path: "back-office", children: [
    { path: "", component: BackOfficeComponent },
    { path: "tables", component: TablesComponent },
    { path: "charts", component: ChartsComponent },
    
    // 📌 Liste des entreprises et ajout
      { path: "entreprises", component: EntrepriseListComponent },
    { path: "entreprises/add", component: EntrepriseAddComponent },
    { path: "entreprises/update/:id", component: EntrepriseAddComponent },
    { path: "entreprises/statistics", component: EntrepriseStatisticsComponent },

    { path: 'stages/ajouter', component: StageAddComponent },
    { path: "stages", component: StageListComponent }, // Liste des stages
    { path: "stages/update/:id", component: StageAddComponent },
    




    { path: "layout-static", component: LayoutStaticComponent },
    { path: "layout-sidenav-light", component: LayoutSidenavLightComponent },
  ]},

  
  { path: "", redirectTo: "home", pathMatch: 'full' },

  { path: "401", component: Error401Component },
  { path: "404", component: Error404Component },
  { path: "500", component: Error500Component },
 
  { path: "login", component: LoginComponent },
  { path: "password", component: PasswordComponent },
  { path: "register", component: RegisterComponent },

  // 📌 Page 404 pour les routes inconnues
  { path: "**", component: Error404Component },
];
