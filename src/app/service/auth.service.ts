// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getKeycloak } from '../core/guards/keycloak';
import Keycloak from 'keycloak-js';

export interface UserInfo {
  givenName?: string;
  familyName?: string;
  fullName?: string;
  username?: string;
  email?: string;
  isAuthenticated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject สำหรับเก็บข้อมูล user
  private userInfoSubject = new BehaviorSubject<UserInfo>({ isAuthenticated: false });
  
  // Observable ที่ component จะ subscribe
  public userInfo$: Observable<UserInfo> = this.userInfoSubject.asObservable();

  constructor() {
    this.initializeUserInfo();
    
    // อัพเดทข้อมูลทุกๆ 30 วินาที
    setInterval(() => {
      this.refreshUserInfo();
    }, 30000);
  }


    getKeycloak(): Keycloak | null {
    return getKeycloak();
  }
  private initializeUserInfo(): void {
    // รอให้ Keycloak initialize เสร็จก่อน
    setTimeout(() => {
      this.refreshUserInfo();
    }, 1000);
  }

  private refreshUserInfo(): void {
    const keycloak = getKeycloak();
    
    if (keycloak?.authenticated && keycloak.tokenParsed) {
      const token = keycloak.tokenParsed as any;
      
      const userInfo: UserInfo = {
        givenName: token.given_name,
        familyName: token.family_name,
        fullName: token.name,
        username: token.preferred_username,
        email: token.email,
        isAuthenticated: true
      };
      
      // ถ้าไม่มี fullName ให้สร้างจาก given_name + family_name
      if (!userInfo.fullName && (userInfo.givenName || userInfo.familyName)) {
        userInfo.fullName = `${userInfo.givenName || ''} ${userInfo.familyName || ''}`.trim();
      }
      
      console.log('User info updated:', userInfo);
      this.userInfoSubject.next(userInfo);
    } else {
      console.log('User not authenticated');
      this.userInfoSubject.next({ isAuthenticated: false });
    }
  }

  // Method สำหรับดึงข้อมูล user แบบ synchronous
  getCurrentUserInfo(): UserInfo {
    return this.userInfoSubject.value;
  }

  // ตรวจสอบสถานะ authentication
  isAuthenticated(): boolean {
    const keycloak = getKeycloak();
    return keycloak?.authenticated ?? false;
  }

  // ดึง token
  getToken(): string | undefined {
    const keycloak = getKeycloak();
    return keycloak?.token;
  }

  // Logout
  logout(): void {
    const keycloak = getKeycloak();
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin
      });
    }
  }

  // Login
  login(): void {
    const keycloak = getKeycloak();
    if (keycloak) {
      keycloak.login();
    }
  }

  // ตรวจสอบ role
  hasRole(role: string): boolean {
    const keycloak = getKeycloak();
    return keycloak?.hasRealmRole(role) ?? false;
  }

  // Force refresh user info
  forceRefresh(): void {
    this.refreshUserInfo();
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    const keycloak = getKeycloak();
    if (!keycloak) return false;

    try {
      const refreshed = await keycloak.updateToken(30); // refresh ถ้าจะหมดอายุใน 30 วิ
      if (refreshed) {
        this.refreshUserInfo(); // อัพเดทข้อมูล user หลัง refresh token
      }
      return refreshed;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}