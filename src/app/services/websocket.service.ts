import { Injectable } from '@angular/core';
import { CompatClient, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { Stage } from '../stage/stage.module'; // Adjust the import path as needed

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private connection: CompatClient | undefined;
  private notificationSubject: Subject<Stage[]> = new Subject<Stage[]>();

  constructor() {
    this.connectWebSocket(); // Automatically connect when the service is instantiated
  }

  // Connect to the WebSocket
  private connectWebSocket(): void {
    const socket = new SockJS('http://localhost:8089/louay/ws');
    this.connection = Stomp.over(socket);

    this.connection.connect({}, () => {
      console.log('WebSocket connected successfully!');

      // Subscribe to the /topic/stageNotifications channel
      this.connection!.subscribe('/topic/stageNotifications', (message) => {
        try {
          const stages: Stage[] = JSON.parse(message.body);
          console.log('Received Stages:', stages); // Log the received stages
          this.notificationSubject.next(stages); // Emit the stages to subscribers
        } catch (error) {
          console.error('Error parsing stage message:', error);
        }
      });

      // Send a message to the /app/stageUpdate endpoint to trigger the backend
      this.connection?.send('/app/stageUpdate', {}, JSON.stringify({}));
    }, (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  // Listen for stage notifications
  public listenForNotifications(): Subject<Stage[]> {
    return this.notificationSubject;
  }
}