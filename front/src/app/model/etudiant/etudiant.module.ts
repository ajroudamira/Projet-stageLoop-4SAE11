export class Etudiant {
  id!: number;
  nom!: string;
  prenom!: string;
  email!: string;
  telephone!: string;
  adresse!: string;
  competences!: string;

  constructor(
    id: number,
    nom: string,
    prenom: string,
    email: string,
    telephone: string,
    adresse: string,
    competences: string
  ) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.telephone = telephone;
    this.adresse = adresse;
    this.competences = competences;
  }
}