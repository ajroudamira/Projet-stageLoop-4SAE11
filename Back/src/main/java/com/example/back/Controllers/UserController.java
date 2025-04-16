package com.example.back.Controllers;

import com.example.back.Entities.Enums.UserRole;
import com.example.back.Entities.User;
import com.example.back.Entities.UserWrapper;
import com.example.back.ExceptionHandling.ApiResponse;
import com.example.back.SecurityConfig.KeycloakConfig;
import com.example.back.ServiceImp.UserLoginTrackingService;
import com.example.back.Services.UserService;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

import static com.example.back.SecurityConfig.KeycloakConfig.keycloak;

@RestController
@RequestMapping("/api/service/user")
@Slf4j
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    
    private final UserService userService;
    private final UserLoginTrackingService loginTrackingService;
    
    // Explicit constructor to resolve initialization issue
    public UserController(UserService userService, UserLoginTrackingService loginTrackingService) {
        this.userService = userService;
        this.loginTrackingService = loginTrackingService;
    }

    //tested and using it in the front end
    @PreAuthorize("hasAnyAuthority('admin')")
    @PostMapping("/CreateUser")
    public ResponseEntity<ApiResponse> addUser(@RequestBody UserWrapper userWrapper) {
        Keycloak k = KeycloakConfig.getInstance();
        UserRepresentation userRep = userWrapper.getKeycloakUser();
        System.out.println("User Representation: " + userRep);
        // Check if the user already exists in the database
        if (userService.existsByLogin(userRep.getUsername()) || userService.existsByLogin(userRep.getEmail())) {
            ApiResponse apiResponse = new ApiResponse(false, "User already exists in the database");
            apiResponse.setData(null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(apiResponse);
        }

        try (Response response = k.realm("constructionRealm").users().create(userRep)) {
            if (response.getStatus() != Response.Status.CREATED.getStatusCode()) {
                ApiResponse apiResponse = new ApiResponse(false, response.readEntity(String.class));
                apiResponse.setData(null);
                return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
            } else {
                UserRepresentation userRepresentation = k.realm("constructionRealm").users().search(userRep.getUsername()).get(0);
                userService.assignRoles(userRepresentation.getId(), userRep.getRealmRoles());
                try {
                    User u = userService.addUser(userWrapper.getUser());
                    ApiResponse apiResponse = new ApiResponse(true, "User created successfully in Keycloak and database");
                    apiResponse.setData(u);
                    return ResponseEntity.ok(apiResponse);
                } catch (Exception e) {
                    ApiResponse apiResponse = new ApiResponse(false, e.getMessage());
                    apiResponse.setData(null);
                    return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
                }
            }
        }
    }


    @PutMapping("/UpdateUser")
    @PreAuthorize("hasAnyAuthority('admin', 'user')")
    public ResponseEntity<ApiResponse> updateUser(@RequestBody UserWrapper user) {
        try {
            User updatedUser = userService.UpdateUser(user.getUser());
            ApiResponse apiResponse = new ApiResponse(true, "User updated successfully in Keycloak and database");
            apiResponse.setData(updatedUser);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse apiResponse = new ApiResponse(false, "Update Failed: " + e.getMessage());
            apiResponse.setData(null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }
    @GetMapping("/getProfilePicture/{userId}")
    public ResponseEntity<String> getProfilePicture(@PathVariable String userId) {
        try {
            UserResource userResource = keycloak.realm("constructionRealm").users().get(userId);
            UserRepresentation userRepresentation = userResource.toRepresentation();

            // Retrieve the profile picture URL
            List<String> profilePictureList = userRepresentation.getAttributes().get("profile_picture");
            if (profilePictureList == null || profilePictureList.isEmpty()) {
                return ResponseEntity.ok("No profile picture set.");
            }

            return ResponseEntity.ok(profilePictureList.get(0)); // Return the stored image URL
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to retrieve profile picture: " + e.getMessage());
        }
    }
    @PreAuthorize("hasAnyAuthority('admin')")
    @PostMapping("/registerAllFromKeycloak")
    public ResponseEntity<ApiResponse> registerAllUsersFromKeycloak() {
        List<UserRepresentation> keycloakUsers = KeycloakConfig.getAllUsers();
        List<String> registeredUsers = new ArrayList<>();

        for (UserRepresentation keycloakUser : keycloakUsers) {
            String login = keycloakUser.getUsername();
            String email = keycloakUser.getEmail();
            String firstName = keycloakUser.getFirstName();
            String lastName = keycloakUser.getLastName();

            // Check if the user exists in the database by login or email
            if (!userService.existsByLogin(login) && !userService.existsByLogin(email)) {  // Assuming you have a method existsByEmail
                // Fetch roles from Keycloak
                List<String> roles = keycloak.realm("constructionRealm")
                        .users()
                        .get(keycloakUser.getId())
                        .roles()
                        .realmLevel()
                        .listAll()
                        .stream()
                        .map(RoleRepresentation::getName)
                        .collect(Collectors.toList());

                // Assign 'admin' or 'user' role dynamically
                String assignedRole = "user"; // Default to user role
                if (roles.contains("admin")) {
                    assignedRole = "admin";
                }
                // student and partner roles will both map to 'user' in our system

                // Create and save the user with dynamic role
                User newUser = new User();
                newUser.setLogin(login);
                newUser.setEmail(email);
                newUser.setFirstName(firstName);
                newUser.setLastName(lastName);
                newUser.setRole(assignedRole); // Dynamically assigned

                userService.addUser(newUser);
                registeredUsers.add(login);
            }
        }

        ApiResponse apiResponse = new ApiResponse(true, "✅ Registered " + registeredUsers.size() + " users.");
        apiResponse.setData(registeredUsers);
        return ResponseEntity.ok(apiResponse);
    }

    //@PreAuthorize("hasAnyAuthority('admin', 'user')")
    @GetMapping("/GetUserByUserName/{username}")
    public ResponseEntity<ApiResponse> getUserByUserName(@PathVariable String username) {
        Keycloak k = KeycloakConfig.getInstance();
        UserWrapper userWrapper = new UserWrapper();

        // 1️⃣ Check if the user exists in the database
        User user = userService.GetUserByUserName(username);
        if (user != null) {
            userWrapper.setUser(user);
            ApiResponse apiResponse = new ApiResponse(true, "User found in database");
            apiResponse.setData(userWrapper);
            return ResponseEntity.ok(apiResponse);
        }

        // 2️⃣ If not found in the database, check Keycloak
        List<UserRepresentation> keycloakUsers = k.realm("constructionRealm").users().search(username);
        if (!keycloakUsers.isEmpty()) {
            UserRepresentation keycloakUser = keycloakUsers.get(0);
            String keycloakUserId = keycloakUser.getId();

            // ✅ Retrieve user roles from Keycloak
            List<RoleRepresentation> roles = k.realm("constructionRealm")
                    .users()
                    .get(keycloakUserId)
                    .roles()
                    .realmLevel()
                    .listAll();

            // ✅ Determine role: Default to "user" unless "admin" is explicitly assigned
            // Check for admin role first, then map student/partner to user role
            String assignedRole = "user"; // Default role
            for (RoleRepresentation role : roles) {
                if ("admin".equalsIgnoreCase(role.getName())) {
                    assignedRole = "admin";
                    break; // If "admin" role is found, assign it and stop checking further
                }
                // For student and partner roles, still assign user role in our system
                // as they should have the same permissions as normal users
            }

            User newUser = new User();
            newUser.setLogin(keycloakUser.getUsername());
            newUser.setEmail(keycloakUser.getEmail());
            newUser.setFirstName(keycloakUser.getFirstName());
            newUser.setLastName(keycloakUser.getLastName());
            newUser.setKeycloakId(keycloakUserId);
            newUser.setRole(assignedRole); // ✅ Dynamically assigned role

            // Save the new user to the database
            newUser = userService.addUser(newUser);
            userWrapper.setUser(newUser);
            ApiResponse apiResponse = new ApiResponse(true, "User registered from Keycloak");
            apiResponse.setData(userWrapper);
            return ResponseEntity.ok(apiResponse);
        }

        // 3️⃣ If user is not found in Keycloak or database
        ApiResponse apiResponse = new ApiResponse(false, "User not found in Keycloak or database");
        apiResponse.setData(null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
    }
    //@PreAuthorize("hasAnyAuthority('admin', 'user')")
    @GetMapping("/GetUserByEmail/{email}")
    public ResponseEntity<ApiResponse> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.GetUserByEmail(email);

        if (user.isPresent()) {
            UserWrapper userWrapper = new UserWrapper();
            userWrapper.setUser(user.get());
            ApiResponse apiResponse = new ApiResponse(true, "User found");
            apiResponse.setData(userWrapper);
            return ResponseEntity.ok(apiResponse);
        }

        ApiResponse apiResponse = new ApiResponse(false, "User not found");
        apiResponse.setData(null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
    }



    // tested on postman
    @PreAuthorize("hasAnyAuthority('admin')")
    @DeleteMapping("/DeleteUser/{username}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String username){
        Keycloak k = KeycloakConfig.getInstance();
        try {
            // First check if user exists in Keycloak
            List<UserRepresentation> keycloakUsers = k.realm("constructionRealm").users().search(username);
            if (keycloakUsers.isEmpty()) {
                log.warn("User {} not found in Keycloak", username);
                // Continue with database deletion even if not in Keycloak
            } else {
                // Delete from Keycloak
                UserRepresentation userRepresentation = keycloakUsers.get(0);
                log.info("Deleting user {} from Keycloak", username);
                k.realm("constructionRealm").users().get(userRepresentation.getId()).remove();
                log.info("Successfully deleted user {} from Keycloak", username);
            }
            
            // Delete from database - this will also handle notification deletion
            log.info("Deleting user {} from database", username);
            userService.DeleteUserByUserName(username);
            log.info("Successfully deleted user {} from database", username);
            
            ApiResponse apiResponse = new ApiResponse(true, "User deleted successfully in Keycloak and database");
            apiResponse.setData(null);
            return ResponseEntity.ok(apiResponse);
        }
        catch (Exception e){
            log.error("Error deleting user {}: {}", username, e.getMessage(), e);
            ApiResponse apiResponse = new ApiResponse(false, "Failed to delete user: " + e.getMessage());
            apiResponse.setData(null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    //tested and using it in Postman
    @GetMapping("/Mysession")
    @PreAuthorize("hasAnyAuthority('admin')")
    public Authentication authentication(Authentication authentication) {
        log.info("Authentication: {}", authentication);
        return authentication;
    }
    //tested and using it in the front end
    @GetMapping("/GetAllUsers")
    @PreAuthorize("hasAnyAuthority('admin')")
    public List<User> getAllUsers(){
        return userService.GetAllUsers();
    }



    @GetMapping("/GetUserLoginHistory/{username}")
    public ResponseEntity<List<Map<String, Object>>> getUserLoginHistory(@PathVariable String username) {
        String realm = "constructionRealm"; // Change this to match your Keycloak realm

        List<Map<String, Object>> loginHistory = KeycloakConfig.getUserLoginEvents(realm, username);

        return ResponseEntity.ok(loginHistory);
    }
    @PostMapping("/CreateUsersFromExcel")
    public ResponseEntity<ApiResponse> addUsersFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            List<String> responses = new ArrayList<>();
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (currentRow.getRowNum() == 0) { // Skip header row
                    continue;
                }

                UserWrapper userWrapper = new UserWrapper();
                User user = new User();
                user.setLogin(currentRow.getCell(0).getStringCellValue());
                user.setEmail(currentRow.getCell(1).getStringCellValue());
                user.setFirstName(currentRow.getCell(3).getStringCellValue());
                user.setLastName(currentRow.getCell(4).getStringCellValue());
                user.setRole(String.valueOf(UserRole.user));
                UserRepresentation userRep = new UserRepresentation();
                userWrapper.setKeycloakUser(userRep);
                userWrapper.setUser(user);
                userWrapper.getKeycloakUser().setUsername(user.getLogin());
                userWrapper.getKeycloakUser().setEmail(user.getEmail());
                userWrapper.getKeycloakUser().setFirstName(user.getFirstName());
                userWrapper.getKeycloakUser().setLastName(user.getLastName());
                userWrapper.getKeycloakUser().setEmailVerified(true);
                userWrapper.getKeycloakUser().setEnabled(true);
                userWrapper.getKeycloakUser().setRealmRoles(List.of("user"));
                CredentialRepresentation credRep = new CredentialRepresentation();
                credRep.setTemporary(true);
                credRep.setType("password");
                credRep.setValue("password");
                userWrapper.getKeycloakUser().setCredentials(List.of(credRep));

                ResponseEntity<ApiResponse> response = addUser(userWrapper);

                if (!response.getBody().isSuccess()) {
                    responses.add("Error occurred while creating user: " + user.getLogin() + " - " + "at line " + currentRow.getRowNum());
                }
            }

            workbook.close();
            if (responses.size() > 0) {
                ApiResponse apiResponse = new ApiResponse(false, responses.stream().reduce("", (a, b) -> a + "\n" + b));
                apiResponse.setData(responses);
                return ResponseEntity.ok(apiResponse);
            }
            ApiResponse apiResponse = new ApiResponse(true, "Users created successfully from Excel file");
            apiResponse.setData(null);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse apiResponse = new ApiResponse(false, "Error occurred while processing Excel file: " + e.getMessage());
            apiResponse.setData(null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/GetAllUsersFromKeycloak")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersFromKeycloak() {
        List<UserRepresentation> keycloakUsers = KeycloakConfig.getAllUsers();
        List<Map<String, Object>> usersList = new ArrayList<>();

        for (UserRepresentation user : keycloakUsers) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("enabled", user.isEnabled());
            userInfo.put("roles", user.getRealmRoles());

            usersList.add(userInfo);
        }

        return ResponseEntity.ok(usersList);
    }


}
