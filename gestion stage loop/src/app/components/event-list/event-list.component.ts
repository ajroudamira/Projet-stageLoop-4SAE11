import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from 'src/app/services/event.service';
import { EventFormComponent } from '../event-form/event-form.component';
import { Event } from 'src/app/models/event';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  displayedColumns: string[] = ['idEvenement', 'categorie', 'dateEvent', 'description', 'titre', 'actions'];
  events: Event[] = [];

  constructor(private eventService: EventService, public dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe(data => {
      this.events = data;
    });
  }

  openDialog(event?: Event) {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '400px',
      data: event ? { ...event } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  deleteEvent(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      this.eventService.deleteEvent(id).subscribe(() => {
        this.snackBar.open("Événement supprimé avec succès", "OK", { duration: 3000 });
        this.loadEvents();
      });
    }
  }
}
