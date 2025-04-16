import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf, *ngFor, ngClass
import { FormsModule } from '@angular/forms'; // Pour ngModel
@Component({
  selector: 'app-transport-fee',
   standalone: true,
    imports: [CommonModule, FormsModule],
  templateUrl: './transport-fee.component.html',
  styleUrls: ['./transport-fee.component.css']
})
export class TransportFeeComponent {
  homeLocation: string = '';
  companyLocation: string = '';
  transportFee: any = null;
  errorMessage: string = '';

  calculateFee() {
    if (!this.homeLocation || !this.companyLocation) {
      this.errorMessage = 'Les emplacements de départ et de destination sont obligatoires.';
      return;
    }

    // Simulate a calculation of transport fee
    this.transportFee = {
      id: 1,
      homeLocation: this.homeLocation,
      companyLocation: this.companyLocation,
      distance: 500, // Example distance
      fee: 10 // Example fee per day
    };

    this.errorMessage = '';
  }
}