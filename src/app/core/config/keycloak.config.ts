// src/app/core/config/keycloak.config.ts
export const keycloakConfig = {
  url: 'http://your-keycloak-server:8080',
  realm: 'your-realm',
  clientId: 'your-client'
};

export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: false,
  flow: 'standard' as const,
  checkLoginIframe: false, // ปิด iframe
  enableLogging: true,
  silentCheckSsoFallback: false,
  checkLoginIframeInterval: 0,
  promiseType: 'native' as const,
  // เพิ่มการจัดการ timeout
  messageReceiveTimeout: 1000, // 1 วินาที
  responseMode: 'fragment' as const,
  redirectUri: window.location.origin,
  // สำหรับ HTTP development
  adapter: 'default'
};