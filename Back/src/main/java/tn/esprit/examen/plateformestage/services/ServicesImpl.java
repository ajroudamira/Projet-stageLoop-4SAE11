package tn.esprit.examen.plateformestage.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.examen.plateformestage.entities.Candidature;
import tn.esprit.examen.plateformestage.entities.Etudiant;
import tn.esprit.examen.plateformestage.entities.StatutCandidature;
import tn.esprit.examen.plateformestage.repositories.EtudiantRepository;
import tn.esprit.examen.plateformestage.repositories.CandidatureRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ServicesImpl implements IServices {

    private final EtudiantRepository etudiantRepository;
    private final CandidatureRepository candidatureRepository;

    @Override
    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }

    @Override
    public Etudiant createEtudiant(Etudiant etudiant) {
        return etudiantRepository.save(etudiant);
    }

    @Override
    public Etudiant updateEtudiant(Long id, Etudiant etudiantDetails) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant avec l'ID " + id + " non trouvé"));
        etudiant.setNom(etudiantDetails.getNom());
        etudiant.setPrenom(etudiantDetails.getPrenom());
        etudiant.setEmail(etudiantDetails.getEmail());
        etudiant.setTelephone(etudiantDetails.getTelephone());
        etudiant.setAdresse(etudiantDetails.getAdresse());
        etudiant.setCompetences(etudiantDetails.getCompetences());
        return etudiantRepository.save(etudiant);
    }

    @Override
    public Etudiant getEtudiantById(Long id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant avec l'ID " + id + " non trouvé"));
    }

    @Override
    public void deleteEtudiant(Long id) {
        etudiantRepository.deleteById(id);
    }

    @Override
    public List<Candidature> getAllCandidatures() {
        return candidatureRepository.findByEtudiantIsNotNull();
    }

    @Override
    public Candidature getCandidatureById(Long id) {
        return candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature avec l'ID " + id + " non trouvée"));
    }

    @Override
    public Candidature createCandidature(Candidature candidature) {
        if (candidature.getEtudiant() != null) {
            Etudiant etudiant = etudiantRepository.findById(candidature.getEtudiant().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Étudiant avec l'ID " + candidature.getEtudiant().getId() + " non trouvé"));
            String lettreMotivation = generateLettreMotivation(candidature, etudiant);
            String cv = generateCv(etudiant);
            candidature.setLettreMotivation(lettreMotivation);
            candidature.setCvUrl(cv);
        }

        // Si la date de candidature est null, définissez-la à la date actuelle
        if (candidature.getDateCandidature() == null) {
            candidature.setDateCandidature(LocalDate.now());
        }

        // Ajouter la logique pour la date d'expiration ici (10 jours après la candidature)
        candidature.setDateExpiration(candidature.getDateCandidature().plusDays(10));

        return candidatureRepository.save(candidature);
    }



    @Override
    public void deleteCandidature(Long id) {
        if (!candidatureRepository.existsById(id)) {
            throw new EntityNotFoundException("Candidature avec l'ID " + id + " non trouvée");
        }
        candidatureRepository.deleteById(id);
    }

    @Override
    public Candidature updateCandidature(Long id, Candidature candidatureDetails) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidature avec l'ID " + id + " non trouvée"));
        candidature.setDateCandidature(candidatureDetails.getDateCandidature());
        candidature.setStatut(candidatureDetails.getStatut());
        candidature.setLettreMotivation(candidatureDetails.getLettreMotivation());
        candidature.setCvUrl(candidatureDetails.getCvUrl());
        if (candidatureDetails.getEtudiant() != null) {
            Etudiant etudiant = etudiantRepository.findById(candidatureDetails.getEtudiant().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Étudiant avec l'ID " + candidatureDetails.getEtudiant().getId() + " non trouvé"));
            candidature.setEtudiant(etudiant);
        }
        return candidatureRepository.save(candidature);
    }

    @Override
    public List<Candidature> searchCandidatures(String keyword) {
        return candidatureRepository.searchCandidatures(keyword);
    }
    @Override
    public List<Etudiant> searchEtudiants(String keyword) {
        return etudiantRepository.searchEtudiants(keyword);    }

    @Override
    public String generateCv(Etudiant etudiant) {
        StringBuilder cv = new StringBuilder();
        cv.append("Nom: ").append(etudiant.getNom()).append("\n");
        cv.append("Prénom: ").append(etudiant.getPrenom()).append("\n");
        cv.append("Email: ").append(etudiant.getEmail()).append("\n");
        cv.append("Compétences: ").append(etudiant.getCompetences()).append("\n");
        return cv.toString();
    }

    @Override
    public String generateLettreMotivation(Candidature candidature, Etudiant etudiant) {
        StringBuilder lettreMotivation = new StringBuilder();
        lettreMotivation.append("Objet: Candidature pour le poste de ").append(candidature.getStatut()).append("\n\n");
        lettreMotivation.append("Madame, Monsieur,\n\n");
        lettreMotivation.append("Je suis ").append(etudiant.getPrenom()).append(" ").append(etudiant.getNom()).append(", ");
        lettreMotivation.append("et je souhaiterais postuler pour le poste ").append(candidature.getStatut()).append(".\n\n");
        lettreMotivation.append("Je possède les compétences suivantes: ").append(etudiant.getCompetences()).append("\n");
        lettreMotivation.append("Je suis convaincu que mon expérience et mes compétences correspondent aux exigences du poste.\n\n");
        lettreMotivation.append("Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.");
        return lettreMotivation.toString();
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?") // Chaque jour à minuit
    public void verifierEtMettreAJourCandidaturesExpirees() {
        List<Candidature> candidatures = candidatureRepository.findAll();
        for (Candidature candidature : candidatures) {
            // Calculer la différence en jours entre la date actuelle et la date de la candidature
            long joursDepuisCandidature = ChronoUnit.DAYS.between(candidature.getDateCandidature(), LocalDate.now());

            // Si la différence est supérieure à 10 jours, changer le statut en EXPIREE
            if (joursDepuisCandidature > 10 && candidature.getStatut() != StatutCandidature.EXPIREE) {
                candidature.setStatut(StatutCandidature.EXPIREE);
                candidatureRepository.save(candidature); // Sauvegarde la candidature mise à jour
            }
        }
    }

    @Override
    @Scheduled(cron = "0 0 0 1 * ?") // Exécution le 1er de chaque mois
    public void supprimerCandidaturesAnciennes() {
        log.info("Suppression des candidatures anciennes lancée");
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        LocalDate today = LocalDate.now();
        List<Candidature> candidatures = candidatureRepository.findByDateExpirationBeforeOrDateCandidatureBefore(today, sixMonthsAgo);
        log.info("Nombre de candidatures trouvées pour suppression: {}", candidatures.size());
        candidatureRepository.deleteAll(candidatures);
        log.info("Candidatures supprimées: {}", candidatures.size());
    }



}



