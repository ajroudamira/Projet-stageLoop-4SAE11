import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutStaticComponent } from './layout-static/layout-static.component';

declare var $: any; // Declare jQuery to avoid TypeScript errors

@Component({
  selector: 'app-back-office',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LayoutStaticComponent],
  templateUrl: './back-office.component.html',
  styleUrl: './back-office.component.css'
})
export class BackOfficeComponent implements OnInit, AfterViewInit {

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
