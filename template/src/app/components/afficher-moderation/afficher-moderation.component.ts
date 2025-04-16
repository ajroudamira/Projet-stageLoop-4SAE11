import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Moderation } from '../../models/moderation';
import { ModerationService } from '../../services/moderationApi';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-afficher-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './afficher-moderation.component.html',
  styleUrls: ['./afficher-moderation.component.css']
})
export class AfficherModerationComponent implements OnInit {
  moderations: Moderation[] = [];
  filteredModerations: Moderation[] = [];
  loading: boolean = false;
  searchQuery: string = '';

  // Statistiques
  totalModerations: number = 0;
  approvedCount: number = 0;
  notApprovedCount: number = 0;
  approvalRate: number = 0;

  constructor(private moderationService: ModerationService, private router: Router) {}

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
      this.filteredModerations = [...this.moderations];
      this.calculateStatistics();
    } catch (error) {
      console.error('Erreur lors de la récupération des modérations', error);
      alert('Une erreur est survenue lors du chargement des modérations.');
    } finally {
      this.loading = false;
    }
  }

  calculateStatistics(): void {
    this.totalModerations = this.moderations.length;
    this.approvedCount = this.moderations.filter(m => m.approved).length;
    this.notApprovedCount = this.totalModerations - this.approvedCount;
    this.approvalRate = this.totalModerations > 0
      ? Math.round((this.approvedCount / this.totalModerations) * 100)
      : 0;
  }

  editModeration(moderation: Moderation): void {
    moderation.editMode = true;
  }

  async updateModeration(moderation: Moderation): Promise<void> {
    if (!moderation.content || moderation.content.trim() === '') {
      alert('Le contenu ne peut pas être vide.');
      return;
    }

    try {
      const response = await this.moderationService.updateModeration(moderation.id, moderation);
      console.log('Modération mise à jour avec succès', response.data);
      moderation.editMode = false;
      this.calculateStatistics();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la modération', error);
      alert('Une erreur est survenue lors de la mise à jour.');
      moderation.editMode = false;
    }
  }

  async deleteModeration(id: number): Promise<void> {
    if (!confirm('Voulez-vous vraiment supprimer cette modération ?')) {
      return;
    }

    try {
      await this.moderationService.deleteModeration(id);
      this.moderations = this.moderations.filter(m => m.id !== id);
      this.filteredModerations = this.filteredModerations.filter(m => m.id !== id);
      this.calculateStatistics();
      console.log('Modération supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  }

  filterModerations(): void {
    this.filteredModerations = this.moderations.filter(moderation =>
      moderation.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (moderation.approved ? 'approuvé' : 'non approuvé').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  navigateToCreateModeration(): void {
    this.router.navigate(['/create-moderation']);
  }
}
