// main-layout.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MainService } from '../service/main.service';
import { MenuItem } from '../model/mainmenu.model';
import { TreeNode } from '../model/treenode.model';
import { AuthService, UserInfo } from '../service/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // UI State
  sidebarOpen = false;
  expandedItems = new Set<number>();
  currentUrl = '';
  currentMenuName: string | null = null;

  // Menu Data
  menu: MenuItem[] = [];
  menuTree: TreeNode[] = [];
  showMenu: any[] = [];

  // Route States
  isDashboard = true;
  isInInboundSection = false;
  isInOutboundSection = false;

  // User Info
  userInfo: UserInfo = { isAuthenticated: false };
  userRole: string | null = null;

  // Subscriptions
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;
  private menuSubscription?: Subscription;

  constructor(
    private router: Router, 
    private mainService: MainService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.routerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.menuSubscription?.unsubscribe();
  }

  private initializeComponent(): void {
    // เก็บ URL ปัจจุบัน
    this.currentUrl = this.router.url;
    this.checkCurrentRoute(this.currentUrl);

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRouteChange(event.url);
      });

    // Subscribe to user info changes
    this.authSubscription = this.authService.userInfo$.subscribe({
      next: (userInfo) => {
        this.handleUserInfoUpdate(userInfo);
      },
      error: (error) => {
        console.error('Error getting user info:', error);
      }
    });

    // Load menu data
    this.loadMenuData();
  }

  private handleRouteChange(url: string): void {
    this.currentUrl = url;
    this.checkCurrentRoute(url);
    
    // Update showMenu if menuTree is loaded
    if (this.menuTree.length > 0) {
      this.updateShowMenuBasedOnRoute(url);
    }
    
    this.updateCurrentMenuName();
  }

  private handleUserInfoUpdate(userInfo: UserInfo): void {
    this.userInfo = userInfo;
    
    if (userInfo.isAuthenticated) {
      // Extract role information from Keycloak token
      this.extractUserRole();
    }
  }

  private extractUserRole(): void {
    const keycloak = this.authService.getKeycloak();
    
    if (!keycloak?.tokenParsed) {
      this.userRole = null;
      return;
    }

    const token = keycloak.tokenParsed as any;
    const { roles, role, groups, realm_access, resource_access } = token;

    // Collect all roles
    let mappedRoles: string[] = [];

    // Add realm roles
    if (realm_access?.roles?.length) {
      mappedRoles = mappedRoles.concat(realm_access.roles);
    }

    // Add client roles
    if (resource_access) {
      const clientRoles = Object.values(resource_access)
        .map((r: any) => r.roles)
        .flat() as string[];
      mappedRoles = mappedRoles.concat(clientRoles);
    }

    // Filter out default Keycloak roles
    const ignoreRoles = [
      'default-roles-yamato',
      'offline_access',
      'uma_authorization',
      'manage-account',
      'manage-account-links',
      'view-profile'
    ];

    const filteredRoles = mappedRoles.filter(role => !ignoreRoles.includes(role));

    // Set user role
    if (filteredRoles.length > 0) {
      this.userRole = filteredRoles
        .map(role => role.charAt(0).toUpperCase() + role.slice(1))
        .join(', ');
    } else if (groups && Array.isArray(groups) && groups.length > 0) {
      // Fallback: use group name as role
      this.userRole = groups[0].replace(/^\//, '');
    } else if (roles && Array.isArray(roles) && roles.length > 0) {
      this.userRole = roles[0];
    } else if (role) {
      this.userRole = role;
    } else {
      this.userRole = 'User';
    }
  }

  private loadMenuData(): void {
    this.menuSubscription = this.mainService.getMenu().subscribe({
      next: (data) => {
        this.menu = data;
        console.log('Menu data loaded:', this.menu);
        
        // Build menu tree
        this.menuTree = this.buildMenuTree(0); // root = 0
        console.log('Menu tree built:', this.menuTree);

        // Update showMenu based on current URL
        this.updateShowMenuBasedOnRoute(this.currentUrl);
        this.updateCurrentMenuName();
      },
      error: (error) => {
        console.error('Error loading menu:', error);
      }
    });
  }

  private checkCurrentRoute(url: string): void {
    this.isDashboard = url === '/' || url === '/dashboard';
    this.isInInboundSection = url.startsWith('/inbound');
    this.isInOutboundSection = url.startsWith('/outbound');

    console.log('Route check:', { url, isDashboard: this.isDashboard, isInInboundSection: this.isInInboundSection, isInOutboundSection: this.isInOutboundSection });
  }

  private updateShowMenuBasedOnRoute(url: string): void {
    if (url.startsWith('/inbound')) {
      this.showMenu = this.menuTree.filter(item => item.Id === 4);
      console.log('Showing inbound menu:', this.showMenu);
    } else if (url.startsWith('/outbound')) {
      this.showMenu = this.menuTree.filter(item => item.Id === 5);
      console.log('Showing outbound menu:', this.showMenu);
    } else {
      this.showMenu = [];
    }
  }

  private updateCurrentMenuName(): void {
    const allMenus = this.flattenMenuTree(this.menuTree);
    const foundMenu = allMenus.find(menu => 
      menu.Link && this.currentUrl.startsWith(menu.Link)
    );
    this.currentMenuName = foundMenu ? foundMenu.Name : null;
  }

  private flattenMenuTree(nodes: TreeNode[]): TreeNode[] {
    let result: TreeNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.Children && node.Children.length > 0) {
        result = result.concat(this.flattenMenuTree(node.Children));
      }
    }
    return result;
  }

  private buildMenuTree(parentId: number): TreeNode[] {
    const children = this.menu.filter(item => item.Parent === parentId);
    const treeNodes: TreeNode[] = [];

    children.forEach(item => {
      const node: TreeNode = {
        ...item,
        Children: this.buildMenuTree(item.Id)
      };
      treeNodes.push(node);
    });

    return treeNodes;
  }

  // Public Methods for Template
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  backToMainMenu(): void {
    this.expandedItems.clear();
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
}