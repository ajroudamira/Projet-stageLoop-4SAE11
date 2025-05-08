package com.example.back.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Internship implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInternship;

    private String title;
    private String description;
    private Date startDate;
    private Date endDate;
    
    @Enumerated(EnumType.STRING)
    private InternshipStatus status;

    private String requiredSkills;
    
    @Enumerated(EnumType.STRING)
    private InternshipType type;

    @ManyToOne
    @JoinColumn(name = "partner_id", referencedColumnName = "id_User")
    private User partner;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "id_User")
    private User student;

    // Explicit setters for fields that need them
    public void setIdInternship(Long idInternship) {
        this.idInternship = idInternship;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public void setStatus(InternshipStatus status) {
        this.status = status;
    }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public void setType(InternshipType type) { this.type = type; }

    public Long getIdInternship() { return idInternship; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Date getStartDate() { return startDate; }
    public Date getEndDate() { return endDate; }
    public InternshipStatus getStatus() { return status; }
    public String getRequiredSkills() { return requiredSkills; }
    public InternshipType getType() { return type; }
    public User getPartner() { return partner; }
    public User getStudent() { return student; }
} 