// src/main.ts (เพิ่มการรอ initialization)
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';
import { initializeKeycloak } from './app/core/guards/keycloak';

// Mock Web Crypto API ก่อนอื่นหมด
(function() {
  'use strict';

  if (!window.crypto) {
    (window as any).crypto = {};
  }

  if (!window.crypto.subtle) {
    (window as any).crypto.subtle = {
      digest: function(algorithm: any, data: any) {
        return Promise.resolve(new ArrayBuffer(32));
      },
      importKey: function() {
        return Promise.resolve({});
      },
      sign: function() {
        return Promise.resolve(new ArrayBuffer(64));
      },
      verify: function() {
        return Promise.resolve(true);
      }
    };
  }

  if (!window.crypto.getRandomValues) {
    (window as any).crypto.getRandomValues = function(array: any) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
})();

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    // // สำคัญ! ให้ Keycloak initialize ก่อนที่ app จะเริ่มทำงาน
    // provideAppInitializer(() => initializeKeycloak()()),
  ]
})
.catch(err => console.error(err));
