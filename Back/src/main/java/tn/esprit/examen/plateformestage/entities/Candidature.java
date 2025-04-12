package tn.esprit.examen.plateformestage.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties("candidatures")
public class Candidature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private LocalDate dateCandidature;

    @Enumerated(EnumType.STRING)
    @NotNull
    private StatutCandidature statut;

    @Lob
    private String lettreMotivation;
    private String cvUrl;

    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    // Champ dateExpiration pour gérer l'expiration de la candidature
    private LocalDate dateExpiration;

    // Méthode pour vérifier si la candidature est expirée
    public boolean estExpiree() {
        // Vérifie si la date d'expiration est antérieure à aujourd'hui et depuis plus de 10 jours
        return this.dateExpiration != null && this.dateExpiration.isBefore(LocalDate.now().minusDays(10));
    }


}
