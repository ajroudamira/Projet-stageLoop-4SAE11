    package tn.esprit.examen.nomPrenomClasseExamen.entities;

    import jakarta.persistence.*;
    import lombok.*;

    import java.io.Serializable;
    import java.time.LocalDate;
    import java.util.Date;
    import java.util.Set;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Entity
    public class Stage{

        @Id
        @GeneratedValue(strategy= GenerationType.IDENTITY)
        Long idStage;


        private String titre;
        private String description;
        private Date dateDebut;
        private Date dateFin;
        @Enumerated(EnumType.STRING)
        private StatusStage statusStage;

        private String competencesRequises;
        @Enumerated(EnumType.STRING)
        private TypeStage typeStage;

        @ManyToOne
        @JoinColumn(name = "entreprise_id", referencedColumnName = "idEntreprise")
        private Entreprise entreprise;


        @ManyToOne
        @JoinColumn(name = "etudiant_id")
        private Etudiant etudiant;

    }
