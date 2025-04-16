package com.example;

import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.List;

public class AIAuthenticatorFactory implements AuthenticatorFactory {
        @Override
        public Authenticator create(KeycloakSession session) {
            return new AIAuthenticator();
        }



        @Override
        public void init(Config.Scope scope) {

        }

        @Override
        public void postInit(KeycloakSessionFactory keycloakSessionFactory) {

        }

        @Override
        public void close() {

        }

        @Override
        public String getId() {
            return null;
        }

        @Override
        public int order() {
            return AuthenticatorFactory.super.order();
        }

        @Override
        public List<ProviderConfigProperty> getConfigMetadata() {
            return AuthenticatorFactory.super.getConfigMetadata();
        }

        @Override
        public String getDisplayType() {
            return null;
        }

        @Override
        public String getReferenceCategory() {
            return null;
        }

        @Override
        public boolean isConfigurable() {
            return false;
        }

        @Override
        public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
            return new AuthenticationExecutionModel.Requirement[0];
        }

        @Override
        public boolean isUserSetupAllowed() {
            return false;
        }

        @Override
        public String getHelpText() {
            return null;
        }

        @Override
        public List<ProviderConfigProperty> getConfigProperties() {
            return null;
        }

        @Override
        public <C> C getConfig() {
            return AuthenticatorFactory.super.getConfig();
        }



}
