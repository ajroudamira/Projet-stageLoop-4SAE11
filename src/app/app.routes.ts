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

export const routes: Routes = [
  {path:"back-office", children:[
    {path:"", component:BackOfficeComponent},
    {path:"tables", component:TablesComponent},
    {path:"charts", component:ChartsComponent},
    {path:"layout-static", component:LayoutStaticComponent},
    {path:"layout-sidenav-ligh", component:LayoutSidenavLightComponent},
  ]},
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
