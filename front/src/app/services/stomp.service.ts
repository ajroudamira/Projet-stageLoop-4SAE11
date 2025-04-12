// src/app/services/stomp.service.ts

import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';  // Import de la bibliothèque STOMP
import SockJS from 'sockjs-client'; // Import de SockJS pour la compatibilité avec WebSocket
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StompService {
  private client: Client;

  constructor() {
    // Création d'une nouvelle instance STOMP
    this.client = new Client({
      brokerURL: `${environment.apiBaseUrl}/louay/ws`,  // L'URL WebSocket du backend Spring Boot
      connectHeaders: {},
      debug: function (str) { console.log(str); },
      webSocketFactory: () => new SockJS(`${environment.apiBaseUrl}/louay/ws`),  // Utilisation de SockJS
      onConnect: (frame) => {
        console.log('WebSocket connecté');
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP', frame);
      }
    });
  }

  // Méthode pour activer la connexion WebSocket
  connect() {
    this.client.activate();
  }

  // Méthode pour désactiver la connexion WebSocket
  disconnect() {
    this.client.deactivate();
  }
}
