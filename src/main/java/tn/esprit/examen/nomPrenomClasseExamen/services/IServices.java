package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Entreprise;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Qcm;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Stage;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeStage;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface IServices {

    Entreprise ajouterEntreprise(Entreprise entreprise);
    Entreprise modifierEntreprise(Long id, Entreprise entreprise);
    void supprimerEntreprise(Long id);
    Entreprise getEntrepriseById(Long id);
    public List<Entreprise> getAllEntreprises();
    Map<String, Long> getStatsEntreprisesParSecteur();


    // STAGE CRUD
    Stage ajouterStage(Stage stage);
    Stage modifierStage(Long id, Stage stage);
    void supprimerStage(Long id);
    Stage getStageById(Long id);
    List<Stage> getAllStages();

    List<Entreprise> rechercherEntrepriseParNom(String nom);

    List<Stage> rechercherStageParTitre(String titre);
    List<Stage> rechercherStageParType(TypeStage  typeStage);

    List<Object[]> getEntreprisesCountBySecteur();

    LocalDate convertToLocalDate(Date date);

    boolean isEndDateApproaching(Stage stage);

    List<Stage> getStagesWithApproachingEndDates();

    List<Stage> getStagesByEntrepriseId(Long entrepriseId);

    List<Qcm> getQcmsByCompetence(String competence);
    Qcm addQcm(Qcm qcm);
    List<Qcm> getAllQcms();

    Stage assignEtudiantToStage(Long idStage, Long idEtudiant);

    }
