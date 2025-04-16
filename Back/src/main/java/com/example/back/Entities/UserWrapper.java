package com.example.back.Entities;

import org.keycloak.representations.idm.UserRepresentation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserWrapper {
    private UserRepresentation keycloakUser;
    private User user;
    private String imageUrl; // Add this field

    public UserRepresentation getKeycloakUser() {
        return keycloakUser;
    }

    public void setKeycloakUser(UserRepresentation keycloakUser) {
        this.keycloakUser = keycloakUser;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
