import { Injectable } from '@angular/core';
import { CompatClient, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { Etudiant } from '../model/etudiant/etudiant.module'; // Create and use an Etudiant model
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EtudiantWebsocketService {
  private connection: CompatClient | undefined;
  // You can use a separate subject for etudiant notifications
  private notificationSubject: Subject<Etudiant> = new Subject<Etudiant>();

  constructor() {
    this.connectWebSocket(); // Automatically connect when the service is instantiated
  }

  // Connect to the WebSocket
  private connectWebSocket(): void {
    const socket = new SockJS(`${environment.apiBaseUrl}/ws`);
    this.connection = Stomp.over(socket);

    this.connection.connect({}, () => {
      console.log('WebSocket connected successfully to etudiantNotifications!');
      // Subscribe to the /topic/etudiantNotifications channel
      this.connection!.subscribe('/topic/etudiantNotifications', (message) => {
        try {
          const etudiant: Etudiant = JSON.parse(message.body);
          console.log('Received Etudiant Notification:', etudiant);
          this.notificationSubject.next(etudiant); // Emit the Etudiant to subscribers
        } catch (error) {
          console.error('Error parsing etudiant message:', error);
        }
      });

      // Optionally, you can send a test message if needed
      // this.connection?.send('/app/test', {}, JSON.stringify({}));
    }, (error: any) => {
      console.error('WebSocket connection error (etudiant):', error);
    });
  }

  // Listen for etudiant notifications
  public listenForEtudiantNotifications(): Subject<Etudiant> {
    return this.notificationSubject;
  }
}
