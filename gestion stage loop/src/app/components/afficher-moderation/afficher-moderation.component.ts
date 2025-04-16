import { Component, OnInit } from '@angular/core';
import { Moderation } from '../../models/moderation';
import { ModerationService } from '../../services/moderationApi';

@Component({
  selector: 'app-afficher-moderation',
  templateUrl: './afficher-moderation.component.html',
  styleUrls: ['./afficher-moderation.component.css']
})
export class AfficherModerationComponent implements OnInit {
  moderations: Moderation[] = [];
  filteredModerations: Moderation[] = [];
  loading: boolean = false;
  searchQuery: string = ''; // Variable pour la recherche

  constructor(private moderationService: ModerationService) {}

  ngOnInit(): void {
    this.loadModerations();
  }

  async loadModerations(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.moderationService.getAllModerations();
      this.moderations = response.data.map((moderation: Moderation) => ({
        ...moderation,
        editMode: false
      }));
      this.filteredModerations = [...this.moderations]; // Initialiser la liste filtrée
    } catch (error) {
      console.error('Erreur lors de la récupération des modérations', error);
    } finally {
      this.loading = false;
    }
  }

  editModeration(moderation: Moderation): void {
    moderation.editMode = true;
  }

  async updateModeration(moderation: Moderation): Promise<void> {
    try {
      const response = await this.moderationService.updateModeration(moderation.id, moderation);
      console.log('Modération mise à jour avec succès', response.data);
      moderation.editMode = false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la modération', error);
    }
  }

  async deleteModeration(id: number): Promise<void> {
    if (confirm('Voulez-vous vraiment supprimer cette modération ?')) {
      try {
        await this.moderationService.deleteModeration(id);
        this.moderations = this.moderations.filter(m => m.id !== id);
        this.filteredModerations = this.filteredModerations.filter(m => m.id !== id); // Mettre à jour la liste filtrée
        console.log('Modération supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de la modération', error);
      }
    }
  }

  filterModerations(): void {
    this.filteredModerations = this.moderations.filter(moderation =>
      moderation.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (moderation.approved ? 'approuvé' : 'non approuvé').includes(this.searchQuery.toLowerCase())
    );
  }
}
