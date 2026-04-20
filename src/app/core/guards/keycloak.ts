import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

let keycloak: Keycloak | null = null;

export function initializeKeycloak() {
  return () => {
    return new Promise<boolean>((resolve, reject) => {
      // ตรวจสอบว่า Keycloak ถูก init แล้วหรือยัง
      if (keycloak) {
        resolve(keycloak.authenticated || false);
        return;
      }

      keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });

      keycloak.init({
        pkceMethod: false,
        flow: 'standard',
        checkLoginIframe: false,
        enableLogging: true
      }).then((authenticated) => {
        console.log('Keycloak initialized successfully, authenticated:', authenticated);
        resolve(authenticated);
      }).catch((error) => {
        console.error('Keycloak initialization failed:', error);
        reject(error);
      });
    });
  };
}

export function getKeycloak(): Keycloak | null {
  return keycloak;
}

// Export keycloak instance โดยตรง
export { keycloak };