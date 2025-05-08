import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TicketService } from './ticket.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private ticketService: TicketService) {}

  loadReportData() {
    // Returns an observable with all report data
    return forkJoin({
      ticketAnalytics: this.ticketService.getAllTickets().pipe(
        map(response => response.success ? response.data || {} : {}),
        catchError(() => of({}))
      ),
      ticketsByStatus: this.ticketService.getTicketsByStatusForAdmin().pipe(
        map(response => response.success ? response.data || {} : {}),
        catchError(() => of({}))
      ),
      ticketsByPriority: this.ticketService.getTicketsByPriorityForAdmin().pipe(
        map(response => response.success ? response.data || {} : {}),
        catchError(() => of({}))
      ),
      responseTimes: this.ticketService.getResponseTimeMetrics().pipe(
        map(response => response.success && response.data ? response.data : { avgFirstResponseTime: 0, avgResolutionTime: 0 }),
        catchError(() => of({ avgFirstResponseTime: 0, avgResolutionTime: 0 }))
      )
    });
  }

  getResponseTimeMetrics() {
    return this.ticketService.getResponseTimeMetrics().pipe(
      map(response => response.success && response.data ? response.data : { avgFirstResponseTime: 0, avgResolutionTime: 0 }),
      catchError(() => of({ avgFirstResponseTime: 0, avgResolutionTime: 0 }))
    );
  }

  getAverageCustomerSatisfaction(): Observable<number> {
    return this.ticketService.getAllTickets(0, 1000).pipe(
      map(response => {
        if (response.success && response.data && response.data.content) {
          const tickets = response.data.content;
          const rated = tickets.filter((t: any) => t.customerSatisfaction !== null && t.customerSatisfaction !== undefined);
          if (rated.length === 0) return 0;
          const sum = rated.reduce((acc: number, t: any) => acc + t.customerSatisfaction, 0);
          return sum / rated.length;
        }
        return 0;
      }),
      catchError(() => of(0))
    );
  }
} 