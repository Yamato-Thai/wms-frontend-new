

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { keycloak } from './keycloak';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';



export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  // if (!isPlatformBrowser(platformId)) {
  //   // SSR: ให้ผ่าน guard โดยไม่ต้อง login หรือ init Keycloak
  //   return true;
  // }
  try {
    if (keycloak.authenticated) {
    return true; // อนุญาตให้เข้าถึงได้ถ้าล็อกอินแล้ว
  } else {
    // หากยังไม่ล็อกอิน เก็บ URL ที่ต้องการไปและทำการล็อกอิน
    // sessionStorage.setItem('redirectUrl', state.url);
    keycloak.login();
    return false;
  }
  } catch (error) {
    console.error('Keycloak init error:', error);
    sessionStorage.setItem('redirectUrl', state.url);
    keycloak.login();
    return false;
  }
};
