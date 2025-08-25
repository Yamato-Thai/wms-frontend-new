import { Routes } from '@angular/router';
import { ReceiveListComponent } from './receive-list.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'receive-list',  // /inbound
        loadComponent: () => import('./receive-list.component').then(m => m.ReceiveListComponent)
      },
    ]
  }
];
