import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-receive-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-list.component.html',
  styleUrls: ['./receive-list.component.scss']
})
export class ReceiveListComponent {
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

