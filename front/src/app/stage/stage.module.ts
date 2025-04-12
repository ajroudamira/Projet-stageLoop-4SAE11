// stage.model.ts

import { Entreprise } from "../entreprise/entreprise.module";
import { StatusStage } from "../enums/statusStage.enum";
import { TypeStage } from "../enums/TypeStage.enum";


export class Stage {
  idStage!: number ;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  competencesRequises: string;
  typeStage: TypeStage;
  statusStage: StatusStage;
  entreprise?: Entreprise;  // Garder Entreprise complet

  constructor(
    idStage: number,
    titre: string,
    description: string,
    dateDebut: Date,
    dateFin: Date,
    competencesRequises: string,
    typeStage: TypeStage = TypeStage.PFE,
    statusStage: StatusStage = StatusStage.DISPONIBLE,
    entreprise?: Entreprise  // Passer l'objet complet Entreprise dans le constructeur
  ) {
    this.idStage = idStage;
    this.titre = titre;
    this.description = description;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.competencesRequises = competencesRequises;
    this.typeStage = typeStage;
    this.statusStage = statusStage;
    this.entreprise = entreprise;  // Assignation de l'objet complet ici
  }
}

