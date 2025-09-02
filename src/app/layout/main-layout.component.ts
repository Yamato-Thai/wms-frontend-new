// ...existing code...
// ...existing code...
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MainService } from '../service/main.service';
import { MenuItem } from '../model/mainmenu.model';
import { TreeNode } from '../model/treenode.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  logout() {
    import('./../core/guards/keycloak').then(({ keycloak }) => {
      keycloak.logout();
    });
  }

  menu: MenuItem[] = [];
  menuTree: TreeNode[] = [];
  showMenu: any[] = [];
  expandedItems = new Set<number>();
  currentUrl = ''; // เก็บ URL ปัจจุบันไว้

  isDashboard = true;
  isInInboundSection = false;
  isInOutboundSection = false;
  fullName: string | null = null;
  userRole: string | null = null;

  constructor(private router: Router, private mainService: MainService) { }

  ngOnInit(): void {
    // เก็บ URL ปัจจุบันไว้
    this.currentUrl = this.router.url;
    this.checkCurrentRoute(this.currentUrl);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
        this.checkCurrentRoute(event.url);
        // ถ้ามี menuTree แล้ว ให้ update showMenu
        if (this.menuTree.length > 0) {
          this.updateShowMenuBasedOnRoute(event.url);
        }
        this.updateCurrentMenuName();
      });

    // ดึงชื่อผู้ใช้จาก keycloak
    this.initializeUserInfo();

    // ดึงข้อมูล menu
    this.mainService.getMenu().subscribe(data => {
      this.menu = data;
      console.log('Menu data:', this.menu);
      
      // สร้าง menuTree
      this.menuTree = this.findMenu(0); // root = 0
      console.log('MenuTree:', this.menuTree);

      // อัพเดท showMenu ตาม URL ปัจจุบัน
      this.updateShowMenuBasedOnRoute(this.currentUrl);
      this.updateCurrentMenuName();
    });
  }

  currentMenuName: string | null = null;

  private updateCurrentMenuName(): void {
    // flatten tree
    const flatten = (nodes: TreeNode[]): TreeNode[] => {
      let arr: TreeNode[] = [];
      for (const node of nodes) {
        arr.push(node);
        if (node.Children && node.Children.length > 0) {
          arr = arr.concat(flatten(node.Children));
        }
      }
      return arr;
    };
    const allMenus = flatten(this.menuTree);
    // หาตัวที่ link ตรงกับ currentUrl (หรือขึ้นต้นด้วย currentUrl)
    const found = allMenus.find(m => m.Link && this.currentUrl.startsWith(m.Link));
    this.currentMenuName = found ? found.Name : null;
  }

  private initializeUserInfo(): void {
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

  // แยก method สำหรับ update showMenu ตาม route
  private updateShowMenuBasedOnRoute(url: string): void {
    if (url.startsWith('/inbound')) {
      this.showMenu = this.menuTree.filter(item => item.Id == 4);
      console.log('Inbound menu:', this.showMenu);
    } else if (url.startsWith('/outbound')) {
      this.showMenu = this.menuTree.filter(item => item.Id == 5);
      console.log('Outbound menu:', this.showMenu);
    } else {
      this.showMenu = [];
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  backToMainMenu() {
    this.expandedItems.clear(); // ปิด submenu ทั้งหมด
    this.router.navigate(['/dashboard']);
  }

  toggleExpanded(itemId: number): void {
 
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isExpanded(itemId: number): boolean {
    return this.expandedItems.has(itemId);
  }

  findMenu(parent: number): TreeNode[] {
    const tmp = this.menu.filter(a => a.Parent === parent);
    const arr: TreeNode[] = [];

    tmp.forEach(element => {
      let node: TreeNode = {
        ...element,
        Children: this.findMenu(element.Id)
      };
      arr.push(node);
    });

    return arr;
  }
}