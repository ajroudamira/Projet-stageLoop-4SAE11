package com.example.back.Repositories;

import com.example.back.Entities.Internship;
import com.example.back.Entities.User;
import com.example.back.Entities.InternshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByPartner(User partner);
    List<Internship> findByStudent(User student);
    List<Internship> findByStatus(InternshipStatus status);
} 