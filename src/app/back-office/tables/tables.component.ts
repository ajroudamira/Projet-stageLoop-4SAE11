import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LayoutStaticComponent } from "../layout-static/layout-static.component";
import { NavbarComponent } from "../navbar/navbar.component";

declare var $: any;

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [LayoutStaticComponent, NavbarComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent implements OnInit, AfterViewInit {

  ngOnInit(): void {
    // Any initialization logic
  }

  ngAfterViewInit(): void {
    this.initializeDataTable();
  }

  private initializeDataTable(): void {
    $(document).ready(function () {
      $('#dataTable').DataTable();
    });

    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
      new (window as any).simpleDatatables.DataTable(datatablesSimple);
    }
  }
}
