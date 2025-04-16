package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Entreprise  {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    Long idEntreprise;

    private String nom;
    private String adresse;
    private String telephone;
    private String email;
    private String secteurActivite;

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Stage> stages;


}
