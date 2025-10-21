import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'adjustment', // /adjust
        loadComponent: () => import('./adjustment/adjustment.component').then(m => m.AdjustmentComponent)
      },
    ]
  }
];

