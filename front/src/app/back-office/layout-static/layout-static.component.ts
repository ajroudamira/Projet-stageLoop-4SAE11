import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout-static',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './layout-static.component.html',
  styleUrl: './layout-static.component.css'
})
export class LayoutStaticComponent {

}
