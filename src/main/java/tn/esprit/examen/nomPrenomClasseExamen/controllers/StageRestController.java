package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Stage;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeStage;
import tn.esprit.examen.nomPrenomClasseExamen.services.IServices;

import java.util.List;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/stages")
public class StageRestController {

    private final IServices services;




    @GetMapping()
    public List<Stage> getAllStages() {
        return services.getAllStages();
    }


    @GetMapping("/afficher-un-seul-stage/{id}")
    public Stage getStageById(@PathVariable Long id) {
        return services.getStageById(id);
    }


    @PostMapping("/ajouter")
    public ResponseEntity<Stage> ajouterStage( @RequestBody Stage stage) {
        Stage savedStage = services.ajouterStage(stage);
        // Notify subscribers if the stage's end date is within 14 days
        return ResponseEntity.ok(savedStage);
    }

    // Modifier un stage existant
    @PutMapping("/modifier/{id}")
    public Stage modifierStage(@PathVariable Long id, @RequestBody Stage stage) {
        return services.modifierStage(id, stage);
    }

    // Supprimer un stage par son ID
    @DeleteMapping("/supprimer/{id}")
    public void supprimerStage(@PathVariable Long id) {
        services.supprimerStage(id);
    }
    @GetMapping("/rechercher")
    public List<Stage> rechercherStageParTitre(@RequestParam String titre) {
        return services.rechercherStageParTitre(titre);
    }
    @GetMapping("/rechercher-avec-type")
    public List<Stage> rechercherStageParType(@RequestParam String typeStage) {
        return services.rechercherStageParType(TypeStage.valueOf(typeStage));
    }

}


