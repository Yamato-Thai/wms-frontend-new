import { Routes } from '@angular/router';
import { ReceiveListComponent } from './receive-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'receive-list', pathMatch: 'full' },
  { path: 'receive-list', component: ReceiveListComponent }
];
