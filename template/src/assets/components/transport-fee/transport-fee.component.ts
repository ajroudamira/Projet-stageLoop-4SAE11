import { Component } from '@angular/core';
import { TransportFeeService, TransportFee } from 'src/app/services/transport-fee.service';

@Component({
  selector: 'app-transport-fee',
  templateUrl: './transport-fee.component.html',
  styleUrls: ['./transport-fee.component.css']
})
export class TransportFeeComponent {
  homeLocation: string = '';
  companyLocation: string = '';
  transportFee?: TransportFee;
  errorMessage: string = '';

  constructor(private transportFeeService: TransportFeeService) {}

  // Méthode pour créer un frais de transport
  calculateFee() {
    this.transportFeeService.createTransportFee(this.homeLocation, this.companyLocation).subscribe(
      (feeData) => {
        this.transportFee = feeData;
        this.errorMessage = ''; // Clear any previous error
      },
      (error) => {
        this.errorMessage = 'Une erreur est survenue lors du calcul des frais de transport.';
        console.error(error);
      }
    );
  }

  // Méthode pour obtenir un frais de transport par ID
  getFeeById(id: number) {
    this.transportFeeService.getTransportFee(id).subscribe(
      (feeData) => {
        this.transportFee = feeData;
        this.errorMessage = ''; // Clear any previous error
      },
      (error) => {
        this.errorMessage = 'Une erreur est survenue lors de la récupération des détails.';
        console.error(error);
      }
    );
  }
}
