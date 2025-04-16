package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Entreprise;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Etudiant;

import java.util.List;

@Repository
public interface IEtudiantRepository extends JpaRepository<Etudiant, Long> {

}