import { Component, OnInit } from '@angular/core';
import { PartnerRequestService, PartnerRequest } from '../../core/services/partner-request.service';

@Component({
  selector: 'app-my-partner-requests',
  templateUrl: './my-partner-requests.component.html',
  styleUrls: ['./my-partner-requests.component.scss']
})
export class MyPartnerRequestsComponent implements OnInit {
  requests: PartnerRequest[] = [];
  loading = true;
  error: string | null = null;

  constructor(private partnerRequestService: PartnerRequestService) {}

  ngOnInit(): void {
    this.partnerRequestService.getMyRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your partner requests.';
        this.loading = false;
      }
    });
  }
} 