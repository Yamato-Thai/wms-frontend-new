import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receive-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  // ข้อมูลจำลองสำหรับรายการ Receive
  receiveList = [
    { 
      id: 'RCV-001', 
      vendor: 'Yamato Foods', 
      date: '2025-09-01', 
      status: 'Received', 
      items: 12,
      details: {
        receiveNumber: 'RCV-001',
        status: 'Received',
        type: 'Normal',
        quality: 'Good',
        remark: 'สินค้าครบตามจำนวน',
        poNumber: 'PO-YF-001',
        poDate: '2025-08-30',
        invoice: 'INV-YF-2025-001',
        supplier: {
          name: 'Yamato Foods',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          contact: 'คุณสมศักดิ์ ใจดี',
          phone: '02-123-4567'
        },
        items: [
          { itemCode: 'YF-001', itemName: 'ข้าวญี่ปุ่น', qty: 100, quality: 'Good', price: 250 },
          { itemCode: 'YF-002', itemName: 'ซอสถั่วเหลือง', qty: 50, quality: 'Good', price: 120 },
          { itemCode: 'YF-003', itemName: 'วาซาบิ', qty: 30, quality: 'Good', price: 180 }
        ]
      }
    },
    { 
      id: 'RCV-002', 
      vendor: 'Siam Logistics', 
      date: '2025-09-03', 
      status: 'Pending', 
      items: 5,
      details: {
        receiveNumber: 'RCV-002',
        status: 'Pending',
        type: 'Normal',
        quality: 'Fair',
        remark: 'รอตรวจสอบคุณภาพสินค้า',
        poNumber: 'PO-SL-002',
        poDate: '2025-09-01',
        invoice: 'INV-SL-2025-002',
        supplier: {
          name: 'Siam Logistics',
          address: '456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          contact: 'คุณวิภา รักดี',
          phone: '02-234-5678'
        },
        items: [
          { itemCode: 'SL-001', itemName: 'กล่องกระดาษ', qty: 200, quality: 'Fair', price: 15 },
          { itemCode: 'SL-002', itemName: 'เทปกาว', qty: 100, quality: 'Good', price: 45 }
        ]
      }
    },
    { 
      id: 'RCV-003', 
      vendor: 'Global Imports', 
      date: '2025-09-05', 
      status: 'Received', 
      items: 20,
      details: {
        receiveNumber: 'RCV-003',
        status: 'Received',
        type: 'Import',
        quality: 'Good',
        remark: 'นำเข้าจากต่างประเทศ ผ่านการตรวจสอบแล้ว',
        poNumber: 'PO-GI-003',
        poDate: '2025-09-02',
        invoice: 'INV-GI-2025-003',
        supplier: {
          name: 'Global Imports',
          address: '789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
          contact: 'Mr. John Smith',
          phone: '02-345-6789'
        },
        items: [
          { itemCode: 'GI-001', itemName: 'เครื่องปรุงนำเข้า A', qty: 50, quality: 'Good', price: 450 },
          { itemCode: 'GI-002', itemName: 'เครื่องปรุงนำเข้า B', qty: 30, quality: 'Good', price: 580 },
          { itemCode: 'GI-003', itemName: 'เครื่องปรุงนำเข้า C', qty: 40, quality: 'Good', price: 320 },
          { itemCode: 'GI-004', itemName: 'เครื่องปรุงนำเข้า D', qty: 25, quality: 'Good', price: 690 }
        ]
      }
    }
  ];
  selectedItem: any = this.receiveList[0];

  select(item: any) {
    this.selectedItem = item;
    // โหลดข้อมูล detail จากข้อมูลจำลอง
    this.header = { ...item.details };
    this.itemsList = [...item.details.items];
    this.showDetail = true;
  }

  // header model for selected receive
  header: any = {
    receiveNumber: '',
    status: '',
    type: '',
    quality: '',
    remark: '',
    poNumber: '',
    poDate: '',
    invoice: '',
    supplier: { name: '', address: '' }
  };

  // items list for detail
  itemsList: Array<any> = [];

  // new item form model
  newItem: any = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };

  addItem() {
    // When no index is provided, we're adding a new item
    this.editingItemIndex = -1;
    this.newItem = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
    this.showItemModal = true;
  }

  editItem(index?: number) {
    if (typeof index === 'number') {
      // Editing existing item
      this.editingItemIndex = index;
      this.newItem = { ...this.itemsList[index] };
    } else {
      // If no index provided, we're adding a new item
      this.editingItemIndex = -1;
      this.newItem = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
    }
    this.showItemModal = true;
  }

  saveItem() {
    if (!this.newItem.itemCode || !this.newItem.itemName || !this.newItem.qty) return;
    
    if (this.editingItemIndex >= 0) {
      // Update existing item
      this.itemsList[this.editingItemIndex] = { ...this.newItem };
    } else {
      // Add new item
      this.itemsList.push({ ...this.newItem });
    }
    
    this.closeItemModal();
  }

  closeItemModal() {
    this.showItemModal = false;
    this.newItem = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
    this.editingItemIndex = -1;
  }

  removeItem(index: number) {
    this.itemsList.splice(index, 1);
  }

  saveHeader() {
    // placeholder: in real app, call service to save header + items
    console.log('Saving header', this.header, 'items', this.itemsList);
  }

  cancelEdit() {
    // reset header/items
    this.header = { receiveNumber: '', status: '', type: '', quality: '', remark: '', poNumber: '', poDate: '', invoice: '', supplier: { name: '', address: '' } };
    this.itemsList = [];
  }

  // UI state
  showDetail = false;
  showHeaderModal = false;
  showItemModal = false;
  editingItemIndex = -1;

  openHeaderModal() {
    this.showHeaderModal = true;
  }

  closeHeaderModal() {
    this.showHeaderModal = false;
  }

  // Getter functions for calculations
  get totalQuantity(): number {
    return this.itemsList.reduce((sum, item) => sum + item.qty, 0);
  }

  get totalValue(): number {
    return this.itemsList.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }
}

