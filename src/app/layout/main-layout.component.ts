import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
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