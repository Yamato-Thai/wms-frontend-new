import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'receive-list',  // /inbound
        loadComponent: () => import('./inbound-list/receive-list.component').then(m => m.ReceiveListComponent)
      },
    ]
  }
];
