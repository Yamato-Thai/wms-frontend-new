// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserInfo } from './service/auth.service';
import { Subscription } from 'rxjs';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'wms-frontend-new';
  userInfo: UserInfo = {};
  private subscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.authService.userInfo$.subscribe(
      userInfo => {
        this.userInfo = userInfo;
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  get fullName(): string {
    if (this.userInfo.fullName) return this.userInfo.fullName;
    if (this.userInfo.givenName && this.userInfo.familyName) {
      return `${this.userInfo.givenName} ${this.userInfo.familyName}`;
    }
    return this.userInfo.username || 'User';
  }

  get isAuthenticated(): boolean {
    return this.userInfo.isAuthenticated ?? false;
  }

  logout(): void {
    this.authService.logout();
  }
}