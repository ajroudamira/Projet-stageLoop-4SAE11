package com.example.back.Services;

import com.example.back.Entities.Candidature;
import com.example.back.Entities.User;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.util.List;

public interface CandidatureService {
    Candidature addCandidature(Candidature candidature, User student);
    Candidature updateCandidature(Long id, Candidature candidature, User student);
    void deleteCandidature(Long id, User student);
    List<Candidature> getCandidaturesByStudent(User student);

    // Admin methods
    List<Candidature> getAllCandidatures();
    Candidature adminUpdateCandidature(Long id, Candidature candidature);
    void adminDeleteCandidature(Long id);

    List<Candidature> searchCandidatures(String keyword);

    Resource getFile(String filename);

    String uploadFile(MultipartFile file);

    void checkAndUpdateExpiredCandidatures();

    void deleteOldCandidatures();

    List<Candidature> getExpiredCandidatures();

    List<Candidature> getCandidaturesByPartner(User partner);
    Candidature updateCandidatureStatusByPartner(Long id, Candidature candidature, User partner);
} 