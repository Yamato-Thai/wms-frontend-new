import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone :true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  isDashboard = true;
  fullName: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // ตรวจสอบ route ปัจจุบัน
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDashboard = event.url === '/' || event.url === '/dashboard';
      });
    // ดึงชื่อผู้ใช้จาก keycloak
    import('./../core/guards/keycloak').then(({ keycloak }) => {
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const { given_name, family_name, name } = keycloak.tokenParsed as any;
        if (given_name && family_name) this.fullName = `${given_name} ${family_name}`;
        else if (name) this.fullName = name;
        else this.fullName = null;
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
