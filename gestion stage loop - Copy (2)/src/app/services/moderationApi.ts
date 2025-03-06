import { Injectable } from '@angular/core';
import axios from 'axios';
import { Moderation } from '../models/moderation';

@Injectable({
  providedIn: 'root' // Cela permet à Angular d'injecter ce service
})
export class ModerationService {
  private baseUrl = 'http://localhost:8089/api/moderations'; // Ajustez l'URL de votre API

  createModeration(moderation: Moderation) {
    return axios.post(this.baseUrl, moderation);
  }

  getAllModerations() {
    return axios.get(this.baseUrl);
  }

  updateModeration(id: number, moderation: Moderation) {
    return axios.put(`${this.baseUrl}/${id}`, moderation);
  }

  deleteModeration(id: number) {
    return axios.delete(`${this.baseUrl}/${id}`);
  }
}
