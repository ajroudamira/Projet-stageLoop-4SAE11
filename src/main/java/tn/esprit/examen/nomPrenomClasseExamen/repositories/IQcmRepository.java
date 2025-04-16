package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Qcm;

import java.util.List;

@Repository
public interface IQcmRepository extends JpaRepository<Qcm, Long> {
    List<Qcm> findByCompetence(String competence);

    List<Qcm> findTop1ByCompetenceIgnoreCase(String competence);

}
