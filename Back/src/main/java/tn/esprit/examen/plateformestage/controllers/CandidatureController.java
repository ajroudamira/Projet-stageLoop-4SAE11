package tn.esprit.examen.plateformestage.controllers;

import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.plateformestage.entities.Candidature;
import tn.esprit.examen.plateformestage.entities.StatutCandidature;
import tn.esprit.examen.plateformestage.repositories.CandidatureRepository;
import tn.esprit.examen.plateformestage.services.IServices;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@EnableDiscoveryClient
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/candidatures")
public class CandidatureController {
    private final IServices service;
    private final CandidatureRepository candidatureRepository;

    @GetMapping
    public List<Candidature> getAllCandidatures() {
        return service.getAllCandidatures(); // Assurez-vous que cela retourne bien l'étudiant avec la candidature
    }

    @PostMapping("/create") // Ajout de / devant create
    public Candidature createCandidature(@RequestBody Candidature candidature) {
        return service.createCandidature(candidature);
    }

    @PutMapping("/update/{id}") // Correction de la route pour mettre à jour
    public Candidature updateCandidature(@PathVariable Long id, @RequestBody Candidature candidatureDetails) {
        return service.updateCandidature(id, candidatureDetails);
    }

    @DeleteMapping("/delete/{id}") // Correction de la route pour supprimer
    public void deleteCandidature(@PathVariable Long id) {
        service.deleteCandidature(id);
    }

    @GetMapping("/{id}")
    public Candidature getCandidatureById(@PathVariable Long id) {
        return service.getCandidatureById(id);
    }

    @GetMapping("/search")
    public List<Candidature> searchCandidatures(@RequestParam String keyword) {
        return service.searchCandidatures(keyword);
    }
    @GetMapping("/cv/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path path = Paths.get("uploads").resolve(filename).normalize();
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = (Resource) new UrlResource(path.toUri());
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Path path = Paths.get("uploads").resolve(file.getOriginalFilename()).normalize();
            Files.copy(file.getInputStream(), path);
            return ResponseEntity.ok("Fichier téléchargé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors du téléchargement du fichier");
        }
    }


    // Ajoutez une route pour vérifier les candidatures expirées
    @GetMapping("/verifier-expirees")
    public ResponseEntity<?> verifierCandidaturesExpirees() {
        try {
            // Logique pour vérifier les candidatures expirées
            service.verifierEtMettreAJourCandidaturesExpirees();
            // Retourne une réponse JSON avec un message
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vérification des candidatures expirées effectuée avec succès");
            return ResponseEntity.ok(response); // Retourne la réponse sous forme de JSON
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Erreur lors de la vérification des candidatures expirées");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



    // Ajoutez une route pour supprimer les candidatures anciennes
    @DeleteMapping("/supprimer-anciennes")
    public ResponseEntity<?> supprimerCandidaturesAnciennes() {
        try {
            // Logique pour supprimer les candidatures expirées
            service.supprimerCandidaturesAnciennes();

            // Retourne une réponse JSON directement
            Map<String, String> response = new HashMap<>();
            response.put("message", "Suppression des candidatures anciennes effectuée avec succès");
            return ResponseEntity.ok(response); // Retourne la Map sous forme de JSON
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Erreur lors de la suppression des candidatures anciennes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/candidatures/expirées")
    public ResponseEntity<List<Candidature>> getCandidaturesExpirees() {
        List<Candidature> candidaturesExpirees = candidatureRepository.findByStatut(StatutCandidature.EXPIREE);
        return ResponseEntity.ok(candidaturesExpirees);
    }



}




