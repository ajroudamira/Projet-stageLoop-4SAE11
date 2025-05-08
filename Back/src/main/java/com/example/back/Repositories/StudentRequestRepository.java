package com.example.back.Repositories;

import com.example.back.Entities.StudentRequest;
import com.example.back.Entities.User;
import com.example.back.Entities.Enums.StudentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRequestRepository extends JpaRepository<StudentRequest, Long> {
    List<StudentRequest> findByUser(User user);
    Optional<StudentRequest> findByUserAndStatus(User user, StudentRequestStatus status);
    List<StudentRequest> findByStatus(StudentRequestStatus status);
} 