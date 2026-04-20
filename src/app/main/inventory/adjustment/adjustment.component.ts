import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdjustmentItem {
  id: string;
  itemCode: string;
  itemName: string;
  currentLocation: string;
  newLocation: string;
  transferQty: number;
  currentQuality: string;
  newQuality: string;
  qualityChangeQty: number;
  currentQty: number;
  adjustmentQty: number;
  newQty: number;
  adjustmentType: 'location' | 'quality' | 'quantity' | 'multiple';
  reason: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjustment.component.html',
  styleUrl: './adjustment.component.scss'
})
export class AdjustmentComponent implements OnInit {
  // Form data for new adjustment
  adjustmentForm = {
    itemCode: '',
    itemName: '',
    currentLocation: '',
    newLocation: '',
    transferQty: 0,
    currentQuality: 'Good',
    newQuality: 'Good',
    qualityChangeQty: 0,
    currentQty: 0,
    adjustmentQty: 0,
    reason: ''
  };

  // Available options
  locations = ['A-01-01', 'A-01-02', 'A-02-01', 'B-01-01', 'B-01-02', 'C-01-01'];
  qualities = ['Good', 'Fair', 'Poor', 'Damaged'];
  
  // Sample items for selection
  availableItems = [
    { code: 'ITEM-001', name: 'ข้าวญี่ปุ่น', location: 'A-01-01', quality: 'Good', qty: 100 },
    { code: 'ITEM-002', name: 'ซอสถั่วเหลือง', location: 'A-01-02', quality: 'Good', qty: 50 },
    { code: 'ITEM-003', name: 'วาซาบิ', location: 'A-02-01', quality: 'Good', qty: 30 },
    { code: 'ITEM-004', name: 'ปลาแซลมอน', location: 'B-01-01', quality: 'Good', qty: 75 },
    { code: 'ITEM-005', name: 'เครื่องแกง', location: 'B-01-02', quality: 'Fair', qty: 120 }
  ];

  // Adjustment history
  adjustmentHistory: AdjustmentItem[] = [];

  // UI states
  selectedAdjustmentType: 'location' | 'quality' | 'quantity' | 'multiple' = 'location';
  showConfirmModal = false;
  itemToCancel: AdjustmentItem | null = null;

  ngOnInit() {
    // Load sample data
    this.loadSampleData();
  }

  loadSampleData() {
    // Sample adjustment history
    this.adjustmentHistory = [
      {
        id: 'ADJ-001',
        itemCode: 'ITEM-001',
        itemName: 'ข้าวญี่ปุ่น',
        currentLocation: 'A-01-01',
        newLocation: 'A-02-01',
        transferQty: 50,
        currentQuality: 'Good',
        newQuality: 'Good',
        qualityChangeQty: 0,
        currentQty: 100,
        adjustmentQty: 0,
        newQty: 100,
        adjustmentType: 'location',
        reason: 'ย้ายเพื่อจัดเรียงใหม่',
        timestamp: new Date('2025-10-20T10:30:00'),
        status: 'completed'
      },
      {
        id: 'ADJ-002',
        itemCode: 'ITEM-003',
        itemName: 'วาซาบิ',
        currentLocation: 'A-02-01',
        newLocation: 'A-02-01',
        transferQty: 0,
        currentQuality: 'Good',
        newQuality: 'Fair',
        qualityChangeQty: 15,
        currentQty: 30,
        adjustmentQty: 0,
        newQty: 30,
        adjustmentType: 'quality',
        reason: 'คุณภาพลดลง',
        timestamp: new Date('2025-10-20T14:15:00'),
        status: 'completed'
      }
    ];
  }

  onItemSelect(event: any) {
    const itemCode = event.target.value;
    const item = this.availableItems.find(i => i.code === itemCode);
    
    if (item) {
      this.adjustmentForm.itemCode = item.code;
      this.adjustmentForm.itemName = item.name;
      this.adjustmentForm.currentLocation = item.location;
      this.adjustmentForm.newLocation = item.location;
      this.adjustmentForm.transferQty = 0;
      this.adjustmentForm.currentQuality = item.quality;
      this.adjustmentForm.newQuality = item.quality;
      this.adjustmentForm.qualityChangeQty = 0;
      this.adjustmentForm.currentQty = item.qty;
      this.adjustmentForm.adjustmentQty = 0;
    }
  }

  calculateNewQty(): number {
    return this.adjustmentForm.currentQty + this.adjustmentForm.adjustmentQty;
  }

  resetForm() {
    this.adjustmentForm = {
      itemCode: '',
      itemName: '',
      currentLocation: '',
      newLocation: '',
      transferQty: 0,
      currentQuality: 'Good',
      newQuality: 'Good',
      qualityChangeQty: 0,
      currentQty: 0,
      adjustmentQty: 0,
      reason: ''
    };
  }

  submitAdjustment() {
    if (!this.adjustmentForm.itemCode) {
      alert('กรุณาเลือกสินค้า');
      return;
    }

    // Determine adjustment type
    let adjustmentType: 'location' | 'quality' | 'quantity' | 'multiple' = 'location';
    const hasLocationChange = this.adjustmentForm.currentLocation !== this.adjustmentForm.newLocation;
    const hasQualityChange = this.adjustmentForm.currentQuality !== this.adjustmentForm.newQuality;
    const hasQtyChange = this.adjustmentForm.adjustmentQty !== 0;
    
    const changeCount = [hasLocationChange, hasQualityChange, hasQtyChange].filter(Boolean).length;
    
    if (changeCount > 1) {
      adjustmentType = 'multiple';
    } else if (hasLocationChange) {
      adjustmentType = 'location';
    } else if (hasQualityChange) {
      adjustmentType = 'quality';
    } else if (hasQtyChange) {
      adjustmentType = 'quantity';
    }

    const newAdjustment: AdjustmentItem = {
      id: 'ADJ-' + String(this.adjustmentHistory.length + 1).padStart(3, '0'),
      itemCode: this.adjustmentForm.itemCode,
      itemName: this.adjustmentForm.itemName,
      currentLocation: this.adjustmentForm.currentLocation,
      newLocation: this.adjustmentForm.newLocation,
      transferQty: this.adjustmentForm.transferQty,
      currentQuality: this.adjustmentForm.currentQuality,
      newQuality: this.adjustmentForm.newQuality,
      qualityChangeQty: this.adjustmentForm.qualityChangeQty,
      currentQty: this.adjustmentForm.currentQty,
      adjustmentQty: this.adjustmentForm.adjustmentQty,
      newQty: this.calculateNewQty(),
      adjustmentType: adjustmentType,
      reason: this.adjustmentForm.reason,
      timestamp: new Date(),
      status: 'completed'
    };

    this.adjustmentHistory.unshift(newAdjustment);
    this.resetForm();
    
    // Show success message
    alert('บันทึกการปรับปรุงสินค้าเรียบร้อยแล้ว');
  }

  confirmCancel(item: AdjustmentItem) {
    this.itemToCancel = item;
    this.showConfirmModal = true;
  }

  cancelAdjustment() {
    if (this.itemToCancel) {
      this.itemToCancel.status = 'cancelled';
      this.showConfirmModal = false;
      this.itemToCancel = null;
    }
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.itemToCancel = null;
  }

  getAdjustmentTypeBadge(type: string): string {
    const badges: any = {
      'location': 'badge-info',
      'quality': 'badge-warning',
      'quantity': 'badge-primary',
      'multiple': 'badge-secondary'
    };
    return badges[type] || 'badge-secondary';
  }

  getAdjustmentTypeLabel(type: string): string {
    const labels: any = {
      'location': 'ย้ายโลเคชั่น',
      'quality': 'เปลี่ยนคุณภาพ',
      'quantity': 'ปรับจำนวน',
      'multiple': 'ปรับหลายรายการ'
    };
    return labels[type] || type;
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'pending': 'badge-warning',
      'completed': 'badge-success',
      'cancelled': 'badge-error'
    };
    return badges[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'รอดำเนินการ',
      'completed': 'สำเร็จ',
      'cancelled': 'ยกเลิก'
    };
    return labels[status] || status;
  }
}
