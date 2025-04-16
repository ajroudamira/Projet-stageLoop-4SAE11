package tn.esprit.examen.nomPrenomClasseExamen.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IEtudiantRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IQcmRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IStageRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IEntrepriseRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j


@RequiredArgsConstructor
@Service
public class ServicesImpl implements IServices {

    private final IEntrepriseRepository entrepriseRepository;
    private final IStageRepository stageRepository;
    private final IEtudiantRepository etudiantRepository;
    private final IQcmRepository iQcmRepository;


    public Stage assignEtudiantToStage(Long idStage, Long idEtudiant) {
        Stage stage = stageRepository.findById(idStage).orElseThrow(() -> new RuntimeException("Stage not found"));
        Etudiant etudiant = etudiantRepository.findById(idEtudiant).orElseThrow(() -> new RuntimeException("Etudiant not found"));

        stage.setEtudiant(etudiant);
        return stageRepository.save(stage);
    }

    public List<Qcm> getAllQcms() {
        return iQcmRepository.findAll();
    }

    public List<Qcm> getQcmsByCompetence(String competence) {
        return iQcmRepository.findByCompetence(competence);
    }

    public Qcm addQcm(Qcm qcm) {
        return iQcmRepository.save(qcm);
    }


    @Override
    public Entreprise ajouterEntreprise(Entreprise entreprise) {
        return entrepriseRepository.save(entreprise);
    }

    @Override
    public Entreprise modifierEntreprise(Long id, Entreprise entreprise) {
        entreprise.setIdEntreprise(id);
        return entrepriseRepository.save(entreprise);
    }

    @Override
    public void supprimerEntreprise(Long id) {
        entrepriseRepository.deleteById(id);
    }

    @Override
    public Entreprise getEntrepriseById(Long id) {
        return entrepriseRepository.findById(id).orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
    }

    @Override
    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }

    @Override
    public Map<String, Long> getStatsEntreprisesParSecteur() {
        return null;
    }

    // STAGE CRUD


    @Override
    public Stage ajouterStage(Stage stage) {
        stage.setIdStage(null); // Très important !
        // Vérifier si une entreprise est associée au stage
        if (stage.getEntreprise() != null) {
            // Rechercher l'entreprise dans la base de données par son ID
            Entreprise entreprise = entrepriseRepository.findById(stage.getEntreprise().getIdEntreprise())
                    .orElseThrow(() -> new EntityNotFoundException("Entreprise avec l'ID " + stage.getEntreprise().getIdEntreprise() + " non trouvée"));

            // Associer l'entreprise trouvée au stage
            stage.setEntreprise(entreprise);
        } else {
            // Si aucune entreprise n'est associée, lancer une exception
            throw new RuntimeException("Une entreprise doit être fournie pour créer un stage.");
        }
        stage.setStatusStage(StatusStage.DISPONIBLE);
        // Sauvegarder le stage dans la base de données
        return stageRepository.save(stage);
    }



    @Override
    public Stage modifierStage(Long id, Stage stage) {
        Stage existingStage = stageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stage non trouvé"));
        existingStage.setTitre(stage.getTitre());
        existingStage.setDescription(stage.getDescription());
        existingStage.setDateDebut(stage.getDateDebut());
        existingStage.setDateFin(stage.getDateFin());
        existingStage.setCompetencesRequises(stage.getCompetencesRequises());
        existingStage.setTypeStage(stage.getTypeStage());
        existingStage.setEntreprise(stage.getEntreprise()); // Assurer la mise à jour de l'entreprise si nécessaire
        return stageRepository.save(existingStage);
    }

    @Override
    public void supprimerStage(Long id) {
        stageRepository.deleteById(id);
    }

    @Override
    public Stage getStageById(Long id) {
        return stageRepository.findById(id).orElseThrow(() -> new RuntimeException("Stage non trouvé"));
    }

    @Override
    public List<Stage> getAllStages() {
        return stageRepository.findByEntrepriseIsNotNull();
    }
    @Override
    public List<Entreprise> rechercherEntrepriseParNom(String nom) {
        return entrepriseRepository.findAllByNom(nom);
    }


    @Override
    public List<Stage> rechercherStageParTitre(String titre) {
        return stageRepository.findAllByTitre(titre);
    }

    // Recherche des stages par type de stage
    @Override
    public List<Stage> rechercherStageParType(TypeStage typeStage) {
        return stageRepository.findAllByTypeStage(typeStage);
    }

    @Override
    public List<Object[]> getEntreprisesCountBySecteur() {
        return entrepriseRepository.countEntreprisesBySecteur();
    }

    @Override
    public LocalDate convertToLocalDate(Date date) {
        // Convert Date to Instant, then to LocalDate
        return date.toInstant()
                .atZone(ZoneId.systemDefault())  // You can change the ZoneId if needed
                .toLocalDate();
    }

    @Override
    public boolean isEndDateApproaching(Stage stage) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = convertToLocalDate(stage.getDateFin());

        // Calculate the difference in days manually
        long daysBetween = endDate.toEpochDay() - today.toEpochDay();
        return daysBetween <= 14 && daysBetween >= 0;
    }

    @Override
    public List<Stage> getStagesWithApproachingEndDates() {
        // Retrieve all stages where the end date is within 14 days from today
        LocalDate today = LocalDate.now();
        LocalDate fourteenDaysLater = today.plusDays(14);
        Date startDate = convertToDate(today);
        Date endDate = convertToDate(fourteenDaysLater);

        return stageRepository.findByDateFinBetween(startDate, endDate);
    }

    // Helper method to convert LocalDate to Date
    private Date convertToDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    @Override
    public List<Stage> getStagesByEntrepriseId(Long entrepriseId) {
        Entreprise entreprise = entrepriseRepository.findById(entrepriseId)
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée avec l'ID : " + entrepriseId));
        return stageRepository.findByEntreprise(entreprise);
    }

}


