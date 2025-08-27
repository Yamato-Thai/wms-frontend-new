import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { keycloak } from './core/guards/keycloak';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wms-frontend-new';
  get fullName(): string | null {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const { given_name, family_name, name } = keycloak.tokenParsed as any;
      if (given_name && family_name) return `${given_name} ${family_name}`;
      if (name) return name;
    }
    return null;
  }
}
