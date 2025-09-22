// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getKeycloak } from './keycloak';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // ตรวจสอบว่าทำงานในเบราว์เซอร์หรือไม่ (สำหรับ SSR)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  try {
    const keycloak = getKeycloak();
    
    // ตรวจสอบว่า Keycloak ถูก initialize แล้วหรือยัง
    if (!keycloak) {
      console.error('Keycloak not initialized');
      router.navigate(['/error']);
      return false;
    }

    // ตรวจสอบสถานะการ login
    if (keycloak.authenticated) {
      console.log('User is authenticated');
      return true;
    } else {
      console.log('User not authenticated, redirecting to login');
      // เก็บ URL ที่ต้องการไปหลังจาก login
      sessionStorage.setItem('redirectUrl', state.url);
      
      // ทำการ login
      await keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      
      return false;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    
    // ในกรณีเกิด error ให้เก็บ URL และพยายาม login
    sessionStorage.setItem('redirectUrl', state.url);
    
    const keycloak = getKeycloak();
    if (keycloak) {
      try {
        await keycloak.login();
      } catch (loginError) {
        console.error('Login failed:', loginError);
        router.navigate(['/error']);
      }
    }
    
    return false;
  }
};

// Alternative: Auth Guard แบบ async/await ที่รอ initialization
export const authGuardWithWait: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  try {
    let keycloak = getKeycloak();
    
    // รอจนกว่า Keycloak จะ initialize เสร็จ
    if (!keycloak) {
      // รอสักครู่แล้วลองใหม่ (สำหรับกรณี timing issue)
      await new Promise(resolve => setTimeout(resolve, 1000));
      keycloak = getKeycloak();
    }
    
    if (!keycloak) {
      console.error('Keycloak initialization timeout');
      router.navigate(['/error']);
      return false;
    }

    // ถ้ายังไม่รู้สถานะ authentication ให้รอ
    if (keycloak.authenticated === undefined) {
      console.log('Waiting for Keycloak authentication status...');
      // รอจนกว่าจะได้ผลลัพธ์
      let attempts = 0;
      while (keycloak.authenticated === undefined && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }

    if (keycloak.authenticated) {
      console.log('User authenticated');
      return true;
    } else {
      console.log('User not authenticated');
      sessionStorage.setItem('redirectUrl', state.url);
      keycloak.login();
      return false;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    router.navigate(['/error']);
    return false;
  }
};