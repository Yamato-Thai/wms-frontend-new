
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{
				path: '',
				redirectTo: 'dashboard',  // ถ้าเข้าหน้า '' ให้ไป dashboard
				pathMatch: 'full'
			},
			{
				path: 'dashboard',
				loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.routes)
			},
			{
				path: 'inbound',
				loadChildren: () => import('./inbound/inbound.routes').then(m => m.routes)
			},
			// เพิ่ม feature อื่น ๆ ที่ต้องการอยู่ใน layout นี้
		]
	}
];
