
import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'inbound',
		loadChildren: () => import('./inbound/inbound.routes').then(m => m.routes)
	}
];
