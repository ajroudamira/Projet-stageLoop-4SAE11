package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Entreprise;

import java.util.List;

@Repository
public interface IEntrepriseRepository extends JpaRepository<Entreprise, Long> {
    List<Entreprise> findAllByNom(String nom);
    @Query("SELECT e.secteurActivite, COUNT(e) FROM Entreprise e GROUP BY e.secteurActivite")
    List<Object[]> countEntreprisesBySecteur();



}