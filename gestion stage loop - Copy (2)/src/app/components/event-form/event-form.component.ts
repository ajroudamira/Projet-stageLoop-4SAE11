import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/models/event';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event
  ) {
    this.eventForm = this.fb.group({
      idEvenement: [data?.idEvenement || null],
      titre: [data?.titre || '', Validators.required],
      description: [data?.description || ''],
      dateEvent: [data?.dateEvent || '', Validators.required],
      categorie: [data?.categorie || '', Validators.required],
    });
  }

  submit(): void {
    if (this.eventForm.valid) {
      const event: Event = this.eventForm.value;
      if (event.idEvenement) {
        this.eventService.updateEvent(event.idEvenement, event).subscribe(() => {
          this.snackBar.open('Événement mis à jour avec succès', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        });
      } else {
        this.eventService.addEvent(event).subscribe(() => {
          this.snackBar.open('Événement ajouté avec succès', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        });
      }
    }
  }
}
