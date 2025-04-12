import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EtudiantService } from '../../services/etudiant.service';
import { EtudiantWebsocketService } from '../../services/etudiant-websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutStaticComponent } from "../../back-office/layout-static/layout-static.component";
import { NavbarComponent } from "../../back-office/navbar/navbar.component";
import { StatistiquesComponent } from '../statistiques/statistiques.component';
import { Etudiant } from '../../model/etudiant/etudiant.module'; // Adjust the path as needed

@Component({
  selector: 'app-etudiant-list',
  standalone: true,
  templateUrl: './etudiant-list.component.html',
  styleUrls: ['./etudiant-list.component.css'],
  imports: [CommonModule, FormsModule, LayoutStaticComponent, NavbarComponent, StatistiquesComponent]
})
export class EtudiantListComponent implements OnInit {
  listEtudiant: any[] = []; // Students to be displayed
  allEtudiants: any[] = []; // Complete list for search
  keyword: string = '';
  
  // New variable for notification
  newEtudiantNotification: Etudiant | null = null;

  constructor(
    private etudiantService: EtudiantService,
    private router: Router,
    private etudiantWSService: EtudiantWebsocketService  // Inject the websocket service
  ) {}

  ngOnInit(): void {
    this.loadEtudiants();
    this.subscribeToNotifications();
  }

  // Subscribe to WebSocket notifications
  subscribeToNotifications(): void {
    this.etudiantWSService.listenForEtudiantNotifications().subscribe({
      next: (etudiant: Etudiant) => {
        console.log('Notification received in EtudiantListComponent:', etudiant);
        this.newEtudiantNotification = etudiant;
        // Hide the notification after 5 seconds
        setTimeout(() => { this.newEtudiantNotification = null; }, 15000);
      },
      error: (err) => {
        console.error('Error receiving notifications:', err);
      }
    });
  }

  // Load all students
  loadEtudiants() {
    this.etudiantService.getEtudiants().subscribe(
      (data) => {
        this.allEtudiants = data;
        this.listEtudiant = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des étudiants :', error);
      }
    );
  }

  searchEtudiants() {
    const search = this.keyword.toLowerCase().trim();

    if (search === '') {
      this.listEtudiant = [...this.allEtudiants]; // Reset the list
    } else {
      this.listEtudiant = this.allEtudiants.filter((etudiant) =>
        (etudiant.nom?.toLowerCase().includes(search) ||
         etudiant.prenom?.toLowerCase().includes(search) ||
         etudiant.email?.toLowerCase().includes(search) ||
         etudiant.competences?.toLowerCase().includes(search))
      );
    }
  }

  // Delete a student
  deleteEtudiant(id: number) {
    this.etudiantService.deleteEtudiant(id).subscribe(
      () => {
        console.log('Étudiant supprimé');
        this.loadEtudiants();
      },
      (error) => {
        console.error("Erreur lors de la suppression de l'étudiant :", error);
      }
    );
  }

  // Redirect to student edit
  editEtudiant(id: number) {
    this.router.navigate([`/back-office/editetudiant/${id}`]);
  }
}
