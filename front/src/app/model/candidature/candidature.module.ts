import { StatutCandidature } from "../../enums/statut-candidature.enum";
import { Etudiant } from "../etudiant/etudiant.module";

export class CandidatureModule {
  id!: number;
  dateCandidature!: Date;
  statut!: StatutCandidature;
  lettreMotivation!: string;
  cvUrl!: string;
  etudiant?: Etudiant; // Rendre etudiant optionnel
  dateExpiration?: Date; // Rendre dateExpiration optionnelle

  constructor(
    id: number,
    dateCandidature: Date,
    statut: StatutCandidature,
    lettreMotivation: string,
    cvUrl: string,
    dateExpiration?: Date, // dateExpiration devient optionnelle
    etudiant?: Etudiant
  ) {
    this.id = id;
    this.dateCandidature = dateCandidature;
    this.statut = statut;
    this.lettreMotivation = lettreMotivation;
    this.cvUrl = cvUrl;
    this.dateExpiration = dateExpiration;
    this.etudiant = etudiant;
  }
}