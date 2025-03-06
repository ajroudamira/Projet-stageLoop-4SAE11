import { Component } from '@angular/core';
import { LayoutStaticComponent } from "../layout-static/layout-static.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [LayoutStaticComponent, NavbarComponent],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent {

}
