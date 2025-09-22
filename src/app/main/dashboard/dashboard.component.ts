// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, UserInfo } from '../../service/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isDashboard = true;
  userInfo: UserInfo = { isAuthenticated: false };
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // ตรวจสอบ route ปัจจุบัน
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDashboard = event.url === '/' || event.url === '/dashboard';
      });

    // ดึงข้อมูลผู้ใช้จาก AuthService
    this.authSubscription = this.authService.userInfo$.subscribe({
      next: (userInfo) => {
        this.userInfo = userInfo;
        console.log('Dashboard received user info:', userInfo);
      },
      error: (error) => {
        console.error('Error getting user info:', error);
      }
    });
  }

  ngOnDestroy() {
    // ยกเลิก subscription เพื่อหลีกเลี่ยง memory leak
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Getter สำหรับดึงชื่อเต็ม
  get fullName(): string | null {
    if (this.userInfo.fullName) {
      return this.userInfo.fullName;
    }
    if (this.userInfo.givenName && this.userInfo.familyName) {
      return `${this.userInfo.givenName} ${this.userInfo.familyName}`;
    }
    if (this.userInfo.username) {
      return this.userInfo.username;
    }
    return null;
  }

  // Getter สำหรับตรวจสอบสถานะ login
  get isAuthenticated(): boolean {
    return this.userInfo.isAuthenticated ?? false;
  }

  // Method สำหรับ navigate
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Method สำหรับ logout
  logout() {
    this.authService.logout();
  }
}
