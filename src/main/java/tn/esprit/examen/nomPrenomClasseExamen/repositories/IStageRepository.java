package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Entreprise;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Stage;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeStage;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Repository
public interface
IStageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findAllByTitre(String titre);

    // Recherche des stages par type de stage
    List<Stage> findAllByTypeStage(TypeStage typeStage);

    List<Stage>findByEntrepriseIsNotNull();

    List<Stage> findByDateFinBetween(Date startDate, Date endDate);

    List<Stage> findByEntreprise(Entreprise entreprise);

}