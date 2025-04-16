package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Entreprise;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Qcm;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Stage;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IQcmRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IServices;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseRestController {

    private String title="Hello, From MS Louay";
    @RequestMapping("/hello")
    public String sayHello()
    {return title;}

    private final IServices services;
    private final IQcmRepository qcmRepository;

    @PostMapping("/stages/{idStage}/assign-etudiant")
    public ResponseEntity<Stage> assignEtudiantToStage(
            @PathVariable Long idStage,
            @RequestBody Map<String, Long> request
    ) {
        Long idEtudiant = request.get("idEtudiant");
        Stage updatedStage = services.assignEtudiantToStage(idStage, idEtudiant);
        return ResponseEntity.ok(updatedStage);
    }
    @GetMapping
    public List<Qcm> getAllQcms() {
        return services.getAllQcms();
    }

    // Récupérer 3 QCM selon les compétences
    @GetMapping("/by-competences")
    public List<Qcm> getQcmByCompetences(@RequestParam String competences) {
        String[] keywords = competences.split(" ");
        List<Qcm> result = new ArrayList<>();

        for (String keyword : keywords) {
            List<Qcm> found = qcmRepository.findTop1ByCompetenceIgnoreCase(keyword);
            if (!found.isEmpty()) {
                result.add(found.get(0));
            }
        }

        return result;
    }

    @GetMapping("/competence/{competence}")
    public List<Qcm> getQcmsByCompetence(@PathVariable String competence) {
        return services.getQcmsByCompetence(competence);
    }

    @PostMapping
    public Qcm createQcm(@RequestBody Qcm qcm) {
        return services.addQcm(qcm);
    }

    @GetMapping("/{id}/stages")
    public ResponseEntity<List<Stage>> getStagesByEntreprise(@PathVariable Long id) {
        List<Stage> stages = services.getStagesByEntrepriseId(id);
        return ResponseEntity.ok(stages);
    }


    // Récupérer toutes les entreprises
    @GetMapping("/Afiicher tous les entreprise")
    public List<Entreprise> getAllEntreprises() {
        return services.getAllEntreprises();
    }

    // Récupérer une entreprise par son ID
    @GetMapping("/Afficher/{id}")
    public Entreprise getEntrepriseById(@PathVariable Long id) {
        return services.getEntrepriseById(id);
    }

    // Ajouter une nouvelle entreprise
    @PostMapping("/ajouter")
    public Entreprise ajouterEntreprise(@RequestBody Entreprise entreprise) {
        if (entreprise.getStages() != null) {
            for (Stage stage : entreprise.getStages()) {
                stage.setEntreprise(entreprise); // Link each stage to the entreprise
            }
        }
        return services.ajouterEntreprise(entreprise);
    }

    // Modifier une entreprise existante
    @PutMapping("/modifer entreprise/{id}")
    public Entreprise modifierEntreprise(@PathVariable Long id, @RequestBody Entreprise entreprise) {
        return services.modifierEntreprise(id, entreprise);
    }

    // Supprimer une entreprise par son ID
    @DeleteMapping("supprimer entreprise/{id}")

    public void supprimerEntreprise(@PathVariable Long id) {
        services.supprimerEntreprise(id);
    }

    @GetMapping("/rechercher-avec-nom")
    public List<Entreprise> rechercherEntrepriseParNom(@RequestParam String nom) {
        return services.rechercherEntrepriseParNom(nom);
    }

    @GetMapping("/statistics")
    public List<Object[]> getEntrepriseStatistics() {
        return services.getEntreprisesCountBySecteur();
    }


}
