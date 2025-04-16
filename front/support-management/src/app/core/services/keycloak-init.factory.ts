import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  console.log('Initializing Keycloak...');
  
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'constructionRealm',
        clientId: 'login-app'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        flow: 'standard',
        pkceMethod: 'S256',
        enableLogging: true
      },
      loadUserProfileAtStartUp: true,
      bearerExcludedUrls: ['/assets', '/hybridaction']
    }).then(authenticated => {
      if (authenticated) {
        console.log('User is authenticated');
      } else {
        console.log('User not authenticated');
      }
      return authenticated;
    }).catch(error => {
      console.error('Keycloak initialization failed', error);
      
      // Detailed error logging - safely check if error exists
      if (error) {
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        
        // Check for specific error types
        if (error.name === 'SecurityError') {
          console.error('Security Error - check CORS settings and iframe policies');
        } else if (error.message && error.message.includes('Failed to fetch')) {
          console.error('Network Error - check if Keycloak server is running');
        } else if (error.message && error.message.includes('Load timeout')) {
          console.error('Timeout Error - Keycloak server may be slow to respond');
        }
      } else {
        console.error('Unknown error during Keycloak initialization');
      }
      
      // Return an initialized app anyway to avoid blocking the application
      return true;
    });
} 