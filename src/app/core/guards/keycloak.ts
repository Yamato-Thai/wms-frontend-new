import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

// สร้างและ export Keycloak instance
export const keycloak = new Keycloak({
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId
});

// ฟังก์ชันเพื่อ init Keycloak (เรียกครั้งเดียว)
export const initializeKeycloak = async () => {
  try {
    const authenticated = await keycloak.init({ onLoad: 'check-sso' ,checkLoginIframe: false});
    console.log(authenticated ? 'Keycloak initialized: Logged in' : 'Keycloak initialized: Not logged in');
  } catch (error) {
    console.error('Keycloak initialization failed', error);
  }
};
