package com.example.back.ServiceImp;

import com.example.back.Entities.Candidature;
import com.example.back.Entities.User;
import com.example.back.Repositories.CandidatureRepository;
import com.example.back.Services.CandidatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.example.back.Entities.Enums.CandidatureStatus;

@Service
public class CandidatureServiceImp implements CandidatureService {

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Override
    public Candidature addCandidature(Candidature candidature, User student) {
        candidature.setStudent(student);
        return candidatureRepository.save(candidature);
    }

    @Override
    public Candidature updateCandidature(Long id, Candidature candidature, User student) {
        Optional<Candidature> existing = candidatureRepository.findById(id);
        if (existing.isPresent() && existing.get().getStudent().getId_User().equals(student.getId_User())) {
            candidature.setId(id);
            candidature.setStudent(student);
            return candidatureRepository.save(candidature);
        }
        throw new RuntimeException("Candidature not found or not owned by student");
    }

    @Override
    public void deleteCandidature(Long id, User student) {
        Optional<Candidature> existing = candidatureRepository.findById(id);
        if (existing.isPresent() && existing.get().getStudent().getId_User().equals(student.getId_User())) {
            candidatureRepository.deleteById(id);
        } else {
            throw new RuntimeException("Candidature not found or not owned by student");
        }
    }

    @Override
    public List<Candidature> getCandidaturesByStudent(User student) {
        return candidatureRepository.findByStudent(student);
    }

    // Admin methods
    @Override
    public List<Candidature> getAllCandidatures() {
        return candidatureRepository.findAll();
    }

    @Override
    public Candidature adminUpdateCandidature(Long id, Candidature candidature) {
        candidature.setId(id);
        return candidatureRepository.save(candidature);
    }

    @Override
    public void adminDeleteCandidature(Long id) {
        candidatureRepository.deleteById(id);
    }

    @Override
    public List<Candidature> searchCandidatures(String keyword) {
        return candidatureRepository.searchCandidatures(keyword);
    }

    @Override
    public Resource getFile(String filename) {
        try {
            Path path = Paths.get("uploads").resolve(filename).normalize();
            if (!Files.exists(path)) {
                return null;
            }
            return new UrlResource(path.toUri());
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path path = uploadDir.resolve(file.getOriginalFilename()).normalize();
            Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return file.getOriginalFilename();
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void checkAndUpdateExpiredCandidatures() {
        List<Candidature> all = candidatureRepository.findAll();
        for (Candidature c : all) {
            if (c.isExpired() && c.getStatus() != CandidatureStatus.EXPIRED) {
                c.setStatus(CandidatureStatus.EXPIRED);
                candidatureRepository.save(c);
            }
        }
    }

    @Override
    public void deleteOldCandidatures() {
        List<Candidature> all = candidatureRepository.findAll();
        for (Candidature c : all) {
            if (c.isExpired()) {
                candidatureRepository.delete(c);
            }
        }
    }

    @Override
    public List<Candidature> getExpiredCandidatures() {
        return candidatureRepository.findByStatus(CandidatureStatus.EXPIRED);
    }

    @Override
    public List<Candidature> getCandidaturesByPartner(User partner) {
        return candidatureRepository.findByPartner(partner);
    }

    @Override
    public Candidature updateCandidatureStatusByPartner(Long id, Candidature candidature, User partner) {
        Optional<Candidature> existing = candidatureRepository.findById(id);
        if (existing.isPresent()) {
            Candidature c = existing.get();
            if (c.getInternship() != null && c.getInternship().getPartner() != null &&
                c.getInternship().getPartner().getId_User().equals(partner.getId_User())) {
                c.setStatus(candidature.getStatus());
                return candidatureRepository.save(c);
            }
        }
        throw new RuntimeException("Candidature not found or not related to partner's internship");
    }
} 