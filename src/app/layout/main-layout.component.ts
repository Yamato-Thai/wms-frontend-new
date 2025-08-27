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
  logout() {
    import('./../core/guards/keycloak').then(({ keycloak }) => {
      keycloak.logout();
    });
  }
  isDashboard = true;
  isInboundOpen = false;
  isOutboundOpen = false;
  isInInboundSection = false;
  isInOutboundSection = false;
  fullName: string | null = null;
  userRole: string | null = null;

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

    // ดึงชื่อผู้ใช้จาก keycloak
    import('./../core/guards/keycloak').then(({ keycloak }) => {
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const { given_name, family_name, name, roles, role, preferred_username, groups, realm_access, resource_access } = keycloak.tokenParsed as any;
        if (given_name && family_name) this.fullName = `${given_name} ${family_name}`;
        else if (name) this.fullName = name;
        else this.fullName = preferred_username || null;

        // รวม role ที่ mapping กับ group (realm_access, resource_access)
        let mappedRoles: string[] = [];
        if (realm_access?.roles?.length) {
          mappedRoles = mappedRoles.concat(realm_access.roles);
        }
        if (resource_access) {
          const clientRoles = Object.values(resource_access)
            .map((r: any) => r.roles)
            .flat();
          mappedRoles = mappedRoles.concat(clientRoles);
        }
        // filter เฉพาะ custom roles ที่ assign เอง
        const ignoreRoles = [
          'default-roles-yamato',
          'offline_access',
          'uma_authorization',
          'manage-account',
          'manage-account-links',
          'view-profile'
        ];
        const filteredRoles = mappedRoles.filter(role => !ignoreRoles.includes(role));
        if (filteredRoles.length) {
          this.userRole = filteredRoles
            .map(role => role.charAt(0).toUpperCase() + role.slice(1))
            .join(', ');
        } else if (groups && Array.isArray(groups) && groups.length > 0) {
          // fallback: ใช้ชื่อ group เป็น role
          this.userRole = groups[0].replace(/^\//, '');
        } else if (roles && Array.isArray(roles) && roles.length > 0) {
          this.userRole = roles[0];
        } else if (role) {
          this.userRole = role;
        } else {
          this.userRole = null;
        }
      }
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