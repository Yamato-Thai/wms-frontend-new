export const environment = {
  production: true,
  apiUrl: 'https://localhost:44309',
  keycloak: {
    url: 'https://auth2.yamatothai.com', // URL ของ Keycloak Server
    realm: 'yut', // ชื่อ realm ที่สร้างใน Keycloak
    clientId: 'new-wms-frontend', // ชื่อ client ที่สร้างใน Keycloak
    // ปิด PKCE เพื่อไม่ให้ใช้ Web Crypto API
    pkceMethod: 'S256'
    // หรือ
    // flow: 'implicit' // ใช้ implicit flow แทน
  }
};
