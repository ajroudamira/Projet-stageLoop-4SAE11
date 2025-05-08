package com.example.back.Repositories;

import com.example.back.Entities.PartnerRequest;
import com.example.back.Entities.User;
import com.example.back.Entities.Enums.PartnerRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRequestRepository extends JpaRepository<PartnerRequest, Long> {
    List<PartnerRequest> findByUser(User user);
    Optional<PartnerRequest> findByUserAndStatus(User user, PartnerRequestStatus status);
    List<PartnerRequest> findByStatus(PartnerRequestStatus status);
} 