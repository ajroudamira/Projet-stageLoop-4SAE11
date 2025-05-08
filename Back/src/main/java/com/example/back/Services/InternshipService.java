package com.example.back.Services;

import com.example.back.Entities.Internship;
import com.example.back.Entities.User;
import com.example.back.Entities.InternshipStatus;
import java.util.List;

public interface InternshipService {
    Internship createInternship(Internship internship);
    Internship updateInternship(Internship internship);
    void deleteInternship(Long id);
    Internship getInternshipById(Long id);
    List<Internship> getAllInternships();
    List<Internship> getInternshipsByPartner(User partner);
    List<Internship> getInternshipsByStudent(User student);
    Internship assignStudentToInternship(Long internshipId, User student);
    Internship updateInternshipStatus(Long internshipId, InternshipStatus status);
} 