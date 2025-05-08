package com.example.back.ServiceImp;

import com.example.back.Entities.Enums.StudentRequestStatus;
import com.example.back.Entities.StudentRequest;
import com.example.back.Entities.User;
import com.example.back.Entities.UserWrapper;
import com.example.back.Repositories.StudentRequestRepository;
import com.example.back.Services.NotificationService;
import com.example.back.Services.StudentRequestService;
import com.example.back.Services.UserService;
import com.example.back.SecurityConfig.KeycloakConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.keycloak.representations.idm.UserRepresentation;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.RoleRepresentation;

@Service
public class StudentRequestServiceImp implements StudentRequestService {
    private static final Logger log = LoggerFactory.getLogger(StudentRequestServiceImp.class);

    private final StudentRequestRepository studentRequestRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final Keycloak keycloak = KeycloakConfig.getInstance();

    public StudentRequestServiceImp(
            StudentRequestRepository studentRequestRepository,
            UserService userService,
            NotificationService notificationService) {
        this.studentRequestRepository = studentRequestRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public StudentRequest createRequest(StudentRequest request) {
        request.setStatus(StudentRequestStatus.PENDING);
        StudentRequest created = studentRequestRepository.save(request);
        // Notify all admins
        List<User> admins = userService.findByRole("admin");
        String message = "A new student upgrade request has been submitted.";
        for (User admin : admins) {
            notificationService.createNotification(message, admin, "STUDENT_REQUEST", null);
        }
        return created;
    }

    @Override
    @Transactional
    public StudentRequest approveRequest(Long requestId) {
        StudentRequest request = getRequestById(requestId);
        if (request.getStatus() != StudentRequestStatus.PENDING) {
            throw new RuntimeException("Can only approve pending requests");
        }
        // Fetch the latest user from the database
        User user = userService.findById(request.getUser().getId_User());
        if (user == null) {
            throw new RuntimeException("User not found");
        }

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

            // Add new student role
            List<RoleRepresentation> newRoles = new ArrayList<>();
            RoleRepresentation newRoleRep = keycloak.realm("constructionRealm")
                .roles()
                .get("student")
                .toRepresentation();
            newRoles.add(newRoleRep);
            
            keycloak.realm("constructionRealm")
                .users()
                .get(keycloakUserId)
                .roles()
                .realmLevel()
                .add(newRoles);

            log.info("Successfully updated user role to student in Keycloak for user: {}", user.getLogin());

            // Update the role in our database
            user.setRole("student");
            userService.UpdateUser(user);

            // Update request status
            request.setStatus(StudentRequestStatus.APPROVED);
            StudentRequest updatedRequest = studentRequestRepository.save(request);
            
            // Notify user about approval
            String message = "Your student upgrade request has been approved!";
            notificationService.createNotification(message, user, "STUDENT_REQUEST_APPROVED", null);
            
            return updatedRequest;
        } catch (Exception e) {
            log.error("Failed to update user role in Keycloak: {}", e.getMessage());
            throw new RuntimeException("Failed to update user role: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public StudentRequest rejectRequest(Long requestId, String reason) {
        StudentRequest request = getRequestById(requestId);
        if (request.getStatus() != StudentRequestStatus.PENDING) {
            throw new RuntimeException("Can only reject pending requests");
        }
        request.setStatus(StudentRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        StudentRequest updatedRequest = studentRequestRepository.save(request);
        // Notify user about rejection
        String message = String.format("Your student upgrade request has been rejected. Reason: %s", reason);
        notificationService.createNotification(message, request.getUser(), "STUDENT_REQUEST_REJECTED", null);
        return updatedRequest;
    }

    @Override
    public List<StudentRequest> getPendingRequests() {
        return studentRequestRepository.findByStatus(StudentRequestStatus.PENDING);
    }

    @Override
    public List<StudentRequest> getUserRequests(User user) {
        return studentRequestRepository.findByUser(user);
    }

    @Override
    public StudentRequest getRequestById(Long requestId) {
        return studentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Student request not found"));
    }
} 