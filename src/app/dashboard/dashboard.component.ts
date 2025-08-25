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

  constructor(private router: Router) {}

  ngOnInit() {
    // ตรวจสอบ route ปัจจุบัน
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDashboard = event.url === '/' || event.url === '/dashboard';
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
