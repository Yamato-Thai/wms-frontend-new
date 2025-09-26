import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'receive-list',  // /inbound
        loadComponent: () => import('./inbound-list/receive-list.component').then(m => m.ReceiveListComponent)
      },
      {
        path: 'import',  // /inbound
        loadComponent: () => import('./import/import.component').then(m => m.ImportComponent)
      },
    ]
  }
];
