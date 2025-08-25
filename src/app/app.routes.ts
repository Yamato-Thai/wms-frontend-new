
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{
				path: 'inbound',
				loadChildren: () => import('./inbound/inbound.routes').then(m => m.routes)
			}
			// เพิ่ม feature อื่น ๆ ที่ต้องการอยู่ใน layout นี้
		]
	}
];
