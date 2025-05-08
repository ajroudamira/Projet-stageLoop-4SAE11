import { Component, OnInit } from '@angular/core';
import { PartnerRequestService, PartnerRequest } from '../../core/services/partner-request.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-partner-requests',
  templateUrl: './admin-partner-requests.component.html',
  styleUrls: ['./admin-partner-requests.component.scss']
})
export class AdminPartnerRequestsComponent implements OnInit {
  requests: PartnerRequest[] = [];
  loading = true;
  error: string | null = null;
  actionLoading: number | null = null;

  constructor(private partnerRequestService: PartnerRequestService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.partnerRequestService.getPendingRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load partner requests.';
        this.loading = false;
      }
    });
  }

  approve(req: PartnerRequest) {
    if (!req.id) return;
    this.actionLoading = req.id;
    this.partnerRequestService.approveRequest(req.id).subscribe({
      next: () => {
        this.toastr.success('Request approved');
        this.loadRequests();
        this.actionLoading = null;
      },
      error: () => {
        this.toastr.error('Failed to approve request');
        this.actionLoading = null;
      }
    });
  }

  reject(req: PartnerRequest) {
    if (!req.id) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    this.actionLoading = req.id;
    this.partnerRequestService.rejectRequest(req.id, reason).subscribe({
      next: () => {
        this.toastr.success('Request rejected');
        this.loadRequests();
        this.actionLoading = null;
      },
      error: () => {
        this.toastr.error('Failed to reject request');
        this.actionLoading = null;
      }
    });
  }
} 