package com.example.back.ServiceImp;

import com.example.back.Entities.Enums.PartnerRequestStatus;
import com.example.back.Entities.PartnerRequest;
import com.example.back.Entities.User;
import com.example.back.Repositories.PartnerRequestRepository;
import com.example.back.Services.NotificationService;
import com.example.back.Services.PartnerRequestService;
import com.example.back.Services.UserService;
import com.example.back.SecurityConfig.KeycloakConfig;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
public class PartnerRequestServiceImp implements PartnerRequestService {
    private static final Logger log = LoggerFactory.getLogger(PartnerRequestServiceImp.class);
    
    private final PartnerRequestRepository partnerRequestRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public PartnerRequestServiceImp(
            PartnerRequestRepository partnerRequestRepository,
            UserService userService,
            NotificationService notificationService) {
        this.partnerRequestRepository = partnerRequestRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public PartnerRequest createRequest(PartnerRequest request) {
        // Check if user already has a pending request
        partnerRequestRepository.findByUserAndStatus(request.getUser(), PartnerRequestStatus.PENDING)
                .ifPresent(existingRequest -> {
                    throw new RuntimeException("User already has a pending partner request");
                });

        request.setStatus(PartnerRequestStatus.PENDING);
        PartnerRequest savedRequest = partnerRequestRepository.save(request);

        // Notify admins about new partner request
        List<User> admins = userService.GetAllUsers().stream()
                .filter(user -> "admin".equals(user.getRole()))
                .toList();

        String message = String.format("New partner request from %s (%s)", 
                request.getUser().getLogin(), 
                request.getCompanyName());

        for (User admin : admins) {
            notificationService.createNotification(message, admin, "PARTNER_REQUEST", null);
        }

        return savedRequest;
    }

    @Override
    @Transactional
    public PartnerRequest approveRequest(Long requestId) {
        PartnerRequest request = getRequestById(requestId);
        if (request.getStatus() != PartnerRequestStatus.PENDING) {
            throw new RuntimeException("Can only approve pending requests");
        }
        User user = userService.findById(request.getUser().getId_User());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        Keycloak keycloak = KeycloakConfig.getInstance();
        try {
            // Get the Keycloak user ID first
            List<UserRepresentation> keycloakUsers = keycloak.realm("constructionRealm")
                    .users()
                    .search(user.getLogin());
            if (keycloakUsers.isEmpty()) {
                throw new RuntimeException("User not found in Keycloak");
            }
            String keycloakUserId = keycloakUsers.get(0).getId();
            // Remove old role
            List<RoleRepresentation> oldRoles = new ArrayList<>();
            RoleRepresentation oldRoleRep = keycloak.realm("constructionRealm")
                .roles()
                .get(user.getRole())
                .toRepresentation();
            oldRoles.add(oldRoleRep);
            keycloak.realm("constructionRealm")
                .users()
                .get(keycloakUserId)
                .roles()
                .realmLevel()
                .remove(oldRoles);
            // Add new partner role
            List<RoleRepresentation> newRoles = new ArrayList<>();
            RoleRepresentation newRoleRep = keycloak.realm("constructionRealm")
                .roles()
                .get("partner")
                .toRepresentation();
            newRoles.add(newRoleRep);
            keycloak.realm("constructionRealm")
                .users()
                .get(keycloakUserId)
                .roles()
                .realmLevel()
                .add(newRoles);
            // Update the role in our database
            user.setRole("partner");
            user.setBusinessSector(request.getBusinessSector());
            userService.UpdateUser(user);
            // Update request status
            request.setStatus(PartnerRequestStatus.APPROVED);
            PartnerRequest updatedRequest = partnerRequestRepository.save(request);
            // Notify user about approval
            String message = "Your partner request has been approved! You can now post internships.";
            notificationService.createNotification(message, user, "PARTNER_REQUEST_APPROVED", null);
            return updatedRequest;
        } catch (Exception e) {
            log.error("Failed to update user role in Keycloak: {}", e.getMessage());
            throw new RuntimeException("Failed to update user role: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PartnerRequest rejectRequest(Long requestId, String reason) {
        PartnerRequest request = getRequestById(requestId);
        
        if (request.getStatus() != PartnerRequestStatus.PENDING) {
            throw new RuntimeException("Can only reject pending requests");
        }

        request.setStatus(PartnerRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        PartnerRequest updatedRequest = partnerRequestRepository.save(request);

        // Notify user about rejection
        String message = String.format("Your partner request has been rejected. Reason: %s", reason);
        notificationService.createNotification(message, request.getUser(), "PARTNER_REQUEST_REJECTED", null);

        return updatedRequest;
    }

    @Override
    public List<PartnerRequest> getPendingRequests() {
        return partnerRequestRepository.findByStatus(PartnerRequestStatus.PENDING);
    }

    @Override
    public List<PartnerRequest> getUserRequests(User user) {
        return partnerRequestRepository.findByUser(user);
    }

    @Override
    public PartnerRequest getRequestById(Long requestId) {
        return partnerRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Partner request not found"));
    }
} 