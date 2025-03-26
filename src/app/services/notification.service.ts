import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private eventSource: EventSource | null = null;

  constructor() { }

  listenForNotifications(): void {
    // Créer la connexion SSE
    this.eventSource = new EventSource('http://localhost:8089/louay/api/notifications/notifications-en-cours');

    // Gestion des messages reçus
    this.eventSource.onmessage = (event) => {
      console.log('Nouvelle notification:', event.data);
      // Ici, tu peux traiter la notification reçue (ex: afficher une alerte)
      alert(event.data); // Par exemple, afficher la notification dans une alerte
    };

    // Gestion des erreurs
    this.eventSource.onerror = (error) => {
      console.error('Erreur SSE:', error);
      this.eventSource?.close(); // Fermer la connexion en cas d'erreur
    };
  }

  // Méthode pour fermer la connexion SSE si nécessaire
  stopListening(): void {
    if (this.eventSource) {
      this.eventSource.close();
      console.log('Connexion SSE fermée');
    }
  }
}
  