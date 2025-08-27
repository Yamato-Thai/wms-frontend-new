import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isDashboard = true;
  isInboundOpen = false;
  isOutboundOpen = false;
  isInInboundSection = false;
  isInOutboundSection = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // ตรวจสอบ URL ปัจจุบันทันทีตอน component initialize
    this.checkCurrentRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkCurrentRoute(event.url);
      });
  }

  private checkCurrentRoute(url: string) {
    // เช็ค dashboard
    this.isDashboard = url === '/' || url === '/dashboard';
    
    // เช็ค sections
    this.isInInboundSection = url.startsWith('/inbound');
    this.isInOutboundSection = url.startsWith('/outbound');
    
    // Debug log (สามารถลบออกได้)
    console.log('Current URL:', url);
    console.log('isDashboard:', this.isDashboard);
    console.log('isInInboundSection:', this.isInInboundSection);
    console.log('isInOutboundSection:', this.isInOutboundSection);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  toggleInboundMenu() {
    this.isInboundOpen = !this.isInboundOpen;
  }

  toggleOutboundMenu() {
    this.isOutboundOpen = !this.isOutboundOpen;
  }

  backToMainMenu() {
    this.router.navigate(['/dashboard']);
  }
}