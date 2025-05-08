package com.example.back.Repositories;

import com.example.back.Entities.Candidature;
import com.example.back.Entities.User;
import com.example.back.Entities.Enums.CandidatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByStudent(User student);
    
    // Search by keyword in motivationLetter or cvUrl
    @Query("SELECT c FROM Candidature c WHERE c.motivationLetter LIKE CONCAT('%', LOWER(:keyword), '%') OR c.cvUrl LIKE CONCAT('%', LOWER(:keyword), '%')")
    List<Candidature> searchCandidatures(@Param("keyword") String keyword);

    List<Candidature> findByStatus(CandidatureStatus status);

    @Query("SELECT c FROM Candidature c WHERE c.internship.partner = :partner")
    List<Candidature> findByPartner(@Param("partner") User partner);
} 