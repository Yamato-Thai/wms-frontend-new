import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    // canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./main/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inbound',
        loadChildren: () => import('./main/inbound/inbound.routes').then(m => m.routes)
      },
      {
        path: 'outbound',
        loadChildren: () => import('./main/outbound/outbound.routes').then(m => m.routes)
      },
      {
        path: 'admin/menu-management',
        loadComponent: () => import('./admin/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
      },
      // เพิ่ม feature อื่น ๆ
    ]
  },{
    path: 'template',
    loadComponent: () => import('./template/template.component').then(m => m.TemplateComponent)
  }
];
