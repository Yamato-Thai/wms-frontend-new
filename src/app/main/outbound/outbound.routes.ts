import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'outbound-list',  // /outbound
        loadComponent: () => import('./outbound-list/outbound-list.component').then(m => m.OutboundListComponent)
      },
    ]
  }
];
