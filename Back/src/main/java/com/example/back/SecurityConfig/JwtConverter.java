package com.example.back.SecurityConfig;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class JwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter=new JwtGrantedAuthoritiesConverter();
    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
                jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
                extractResourceRoles(jwt).stream()
        ).collect(Collectors.toSet());
        return new JwtAuthenticationToken(jwt, authorities,jwt.getClaim("preferred_username"));
    }
    private Collection<GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Map<String , Object> realmAccess;
        Collection<String> roles;
        if(jwt.getClaim("realm_access")==null){
            return Set.of();
        }
        realmAccess = jwt.getClaim("realm_access");
        roles = (Collection<String>) realmAccess.get("roles");
        return roles.stream().map(role->new SimpleGrantedAuthority(role)).collect(Collectors.toSet());
    }

}
/*
{
  "exp": 1708710928,
  "iat": 1708710628,
  "jti": "68e72959-f578-445f-a576-bcbce38e2538",
  "iss": "http://localhost:8080/realms/GestionStageRealm",
  "aud": "account",
  "sub": "6f78a7fb-fd96-419b-873e-5ff7544314af",
  "typ": "Bearer",
  "azp": "login-app",
  "session_state": "91ca2019-e7c9-4553-9b18-df8531f1c166",
  "acr": "1",
  "allowed-origins": [
    "http://localhost:9090"
  ],
  "realm_access": {
    "roles": [
      "default-roles-gestionstagerealm",
      "offline_access",
      "uma_authorization",
      "Super-Admin"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "email profile microprofile-jwt",
  "sid": "91ca2019-e7c9-4553-9b18-df8531f1c166",
  "upn": "super-admin",
  "email_verified": false,
  "name": "super admin",
  "groups": [
    "default-roles-gestionstagerealm",
    "offline_access",
    "uma_authorization",
    "Super-Admin"
  ],
  "preferred_username": "super-admin",
  "given_name": "super",
  "family_name": "admin"
}
 */
