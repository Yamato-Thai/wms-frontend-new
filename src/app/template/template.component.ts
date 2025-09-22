import { Component } from '@angular/core';

@Component({
  selector: 'app-template',
  imports: [],
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss'
})
export class TemplateComponent {
toggleState1 = true;
  toggleState2 = false;
  darkMode = false;
  notifications = true;
  showDropdown = false;
  showModal = false;
  showConfirmModal = false;
  showImageModal = false;
  showSuccessToast = false;
  showWarningToast = false;
  showErrorToast = false;
  showTooltip1 = false;
  showTooltip2 = false;
}
