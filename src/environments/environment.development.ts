export const environment = {
  production: false,
  apiUrl: 'https://localhost:44309',
  keycloak: {
    url: 'https://auth2.yamatothai.com', // URL ของ Keycloak Server
    realm: 'yut', // ชื่อ realm ที่สร้างใน Keycloak
    clientId: 'new-wms-frontend-local', // ชื่อ client ที่สร้างใน Keycloak
  }
};
