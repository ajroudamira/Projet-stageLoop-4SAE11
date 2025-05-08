package com.example.back.ServiceImp;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back.Entities.Enums.UserRole;
import static com.example.back.Entities.Enums.UserRole.user;
import com.example.back.Entities.Ticket;
import com.example.back.Entities.User;
import com.example.back.Repositories.TicketRepository;
import com.example.back.Repositories.UserRepository;
import com.example.back.SecurityConfig.KeycloakConfig;
import com.example.back.Services.NotificationService;
import com.example.back.Services.UserService;


@Service
public class UserServiceImp implements UserService {
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    Keycloak keycloak = KeycloakConfig.getInstance();
    
    // Define logger explicitly since @Slf4j is not working
    private static final Logger log = LoggerFactory.getLogger(UserServiceImp.class);
    
    // Explicit constructor to resolve initialization issue
    public UserServiceImp(UserRepository userRepository, TicketRepository ticketRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    @Override
    public User addUser(User user) {
        log.info("Role being saved: {}", user.getRole());

        return userRepository.save(user);
    }

    @Override
    public List<User> AddUsers(List<User> users) {
        return userRepository.saveAll(users);
    }

    @Override
    public User UpdateUser(User updatedUser) {
        try {
            // ✅ Fetch the user from Keycloak using their username (login)
            List<UserRepresentation> keycloakUsers = keycloak.realm("constructionRealm")
                    .users()
                    .search(updatedUser.getLogin());

            if (keycloakUsers.isEmpty()) {
                log.error("❌ User not found in Keycloak: " + updatedUser.getLogin());
                throw new RuntimeException("User not found in Keycloak");
            }

            UserRepresentation keycloakUser = keycloakUsers.get(0);
            String keycloakUserId = keycloakUser.getId(); // Get Keycloak user ID

            // ✅ Update user fields in Keycloak
            keycloakUser.setFirstName(updatedUser.getFirstName());
            keycloakUser.setLastName(updatedUser.getLastName());
            keycloakUser.setEmail(updatedUser.getEmail());

            // ✅ Send the update request to Keycloak
            keycloak.realm("constructionRealm").users().get(keycloakUserId).update(keycloakUser);
            log.info("✅ User basic info updated in Keycloak: " + updatedUser.getLogin());

            // Get the old user data to check for role changes
            User oldUser = userRepository.findByLogin(updatedUser.getLogin());
            String oldRole = oldUser != null ? oldUser.getRole() : null;
            String newRole = updatedUser.getRole();

            // If role has changed, update it in Keycloak
            if (oldRole != null && !oldRole.equals(newRole)) {
                log.info("Role change detected: {} -> {}", oldRole, newRole);
                
                // Remove old role
                List<RoleRepresentation> oldRoles = new ArrayList<>();
                RoleRepresentation oldRoleRep = keycloak.realm("constructionRealm")
                    .roles()
                    .get(oldRole)
                    .toRepresentation();
                oldRoles.add(oldRoleRep);
                
                keycloak.realm("constructionRealm")
                    .users()
                    .get(keycloakUserId)
                    .roles()
                    .realmLevel()
                    .remove(oldRoles);

                // Add new role
                List<RoleRepresentation> newRoles = new ArrayList<>();
                RoleRepresentation newRoleRep = keycloak.realm("constructionRealm")
                    .roles()
                    .get(newRole)
                    .toRepresentation();
                newRoles.add(newRoleRep);
                
                keycloak.realm("constructionRealm")
                    .users()
                    .get(keycloakUserId)
                    .roles()
                    .realmLevel()
                    .add(newRoles);

                log.info("✅ User role updated in Keycloak for user: {}", updatedUser.getLogin());

                // Notify admins about role change to student
                if ("student".equalsIgnoreCase(newRole)) {
                    List<User> admins = userRepository.findByRole("admin");
                    String message = "User '" + updatedUser.getLogin() + "' has been updated to student role.";
                    for (User admin : admins) {
                        notificationService.createNotification(message, admin, "ROLE_UPDATE", null);
                    }
                }
            }

            // ✅ After successful Keycloak update, update the database
            return userRepository.save(updatedUser);
        } catch (Exception e) {
            log.error("❌ Failed to update user: " + e.getMessage());
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
    }

    @Override
    public User UpdateUser(com.example.back.Entities.UserWrapper userWrapper) {
        if (userWrapper == null || userWrapper.getUser() == null) {
            throw new IllegalArgumentException("UserWrapper or contained User is null");
        }
        // Optionally, you can use keycloakUser from the wrapper if needed
        return UpdateUser(userWrapper.getUser());
    }

    @Override
    public void DeleteUserByUserName(String username) {
        try {
            // Get user first
            User user = userRepository.findByLogin(username);
            if (user == null) {
                log.warn("User not found for deletion: {}", username);
                return;
            }
            
            Long userId = user.getId_User();
            
            // First, delete all notifications for this user
            try {
                log.info("Deleting all notifications for user: {}", username);
                notificationService.deleteAllNotifications(user);
                log.info("Successfully deleted all notifications for user: {}", username);
            } catch (Exception e) {
                log.error("Error deleting notifications for user {}: {}", username, e.getMessage(), e);
                // Continue with deletion even if notification deletion fails
            }
            
            // Next, unassign any tickets assigned to this admin
            unassignAllTicketsFromUser(user);
            
            // Now delete the user
            userRepository.deleteById(userId);
            log.info("User deleted successfully: {}", username);
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }
    
    /**
     * Unassigns all tickets from a user before deletion to avoid foreign key constraint violations
     */
    private void unassignAllTicketsFromUser(User user) {
        try {
            // Find all tickets assigned to this user
            List<Ticket> assignedTickets = ticketRepository.findByAssignedAdmin(user, Pageable.unpaged()).getContent();
            
            if (assignedTickets.isEmpty()) {
                log.info("No tickets found assigned to user {}", user.getLogin());
                return;
            }
            
            log.info("Unassigning {} tickets from user {} before deletion", assignedTickets.size(), user.getLogin());
            
            // Unassign each ticket
            for (Ticket ticket : assignedTickets) {
                ticket.setAssignedAdmin(null);
                ticketRepository.save(ticket);
            }
            
            log.info("Successfully unassigned all tickets from user {}", user.getLogin());
        } catch (Exception e) {
            log.error("Error unassigning tickets from user {}: {}", user.getLogin(), e.getMessage(), e);
            throw new RuntimeException("Failed to unassign tickets: " + e.getMessage());
        }
    }

    @Override
    public List<User> GetAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> GetUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    @Override
    public User GetUserByUserName(String username) {
        try {
            return userRepository.findByLogin(username);
        } catch (org.hibernate.NonUniqueResultException e) {
            log.warn("Multiple users found with login: {}. Returning the first one.", username);
            // Get all users and filter by login manually to get the first one
            return userRepository.findAll().stream()
                .filter(user -> username.equals(user.getLogin()))
                .findFirst()
                .orElse(null);
        }
    }


    public void assignRoles(String userId, List<String> roles) {
        List<RoleRepresentation> roleList = rolesToRealmRoleRepresentation(roles);
        keycloak.realm("constructionRealm")
                .users()
                .get(userId)
                .roles()
                .realmLevel()
                .add(roleList);
    }


    private List<RoleRepresentation> rolesToRealmRoleRepresentation(List<String> roles) {
        List<RoleRepresentation> existingRoles = keycloak.realm("constructionRealm")
                .roles()
                .list();

        List<String> serverRoles = existingRoles
                .stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());
        List<RoleRepresentation> resultRoles = new ArrayList<>();

        for (String role : roles) {
            int index = serverRoles.indexOf(role);
            if (index != -1) {
                resultRoles.add(existingRoles.get(index));
            } else {
                log.info("Role doesn't exist");
            }
        }
        return resultRoles;
    }

    public void syncUsersFromKeycloak() {
        Keycloak k = KeycloakConfig.getInstance();
        log.info("Fetching users from Keycloak...");

        try {
            List<UserRepresentation> keycloakUsers = k.realm("constructionRealm").users().list();

            for (UserRepresentation keycloakUser : keycloakUsers) {
                // Check if user already exists by email or login to avoid duplicates
                boolean userExistsByEmail = false;
                try {
                    userExistsByEmail = userRepository.findByEmail(keycloakUser.getEmail()) != null;
                } catch (org.hibernate.NonUniqueResultException e) {
                    userExistsByEmail = true;
                    log.warn("Multiple users found with email: {}", keycloakUser.getEmail());
                }
                
                boolean userExistsByLogin = false;
                try {
                    userExistsByLogin = existsByLogin(keycloakUser.getUsername());
                } catch (Exception e) {
                    userExistsByLogin = true;
                    log.warn("Error checking if user exists by login: {}", e.getMessage());
                }
                
                if (!userExistsByEmail && !userExistsByLogin) {
                    log.info("Adding user from Keycloak to database: {}", keycloakUser.getEmail());

                    User newUser = new User();
                    newUser.setEmail(keycloakUser.getEmail());
                    newUser.setLogin(keycloakUser.getUsername());
                    newUser.setFirstName(keycloakUser.getFirstName());
                    newUser.setLastName(keycloakUser.getLastName());
                    newUser.setKeycloakId(keycloakUser.getId());

                    // Extract only one role (either 'admin' or 'user')
                    List<String> roles = keycloak.realm("constructionRealm")
                            .users()
                            .get(keycloakUser.getId())
                            .roles()
                            .realmLevel()
                            .listAll()
                            .stream()
                            .map(RoleRepresentation::getName)
                            .collect(Collectors.toList());

                    // Assign the correct role
                    String assignedRole = roles.contains("admin") ? "admin" : "user";
                    newUser.setRole(String.valueOf(UserRole.valueOf(String.valueOf(user))));

                    userRepository.save(newUser);
                } else {
                    log.info("User already exists in database: {} ({})", keycloakUser.getUsername(), keycloakUser.getEmail());
                }
            }
            log.info("Keycloak users successfully synchronized to the database.");
        } catch (Exception e) {
            log.error("Error synchronizing Keycloak users: {}", e.getMessage());
        }
    }

    public boolean existsByLogin(String login) {
        try {
            return userRepository.findByLogin(login) != null;
        } catch (org.hibernate.NonUniqueResultException e) {
            log.warn("Multiple users found with login: {}. User exists.", login);
            return true; // If multiple users exist with this login, then the login exists
        }
    }

    // Schedule this method to run every hour

    @Override
    public User findById(Long idadmin) {
        return userRepository.findById(idadmin).orElse(null);
    }

    @Override
    public User findByIsTicketManager(boolean isTicketManager) {
        return userRepository.findByIsTicketManager(isTicketManager);
    }

    @Override
    public List<User> findByRole(String role) {
        return userRepository.findByRole(role);
    }
}
