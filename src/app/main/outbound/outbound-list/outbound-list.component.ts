import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchCenterComponent, SearchResult, SearchFilters } from '../../component-center/search-center/search-center.component';
import { SearchConfigService } from '../../../service/search-config.service';

@Component({
  selector: 'app-outbound-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchCenterComponent],
  templateUrl: './outbound-list.component.html',
  styleUrls: ['./outbound-list.component.scss']
})
export class OutboundListComponent implements OnInit {
  searchConfig: any;
  
  // เก็บข้อมูล original และ filtered
  originalOutboundList: any[] = [];
  filteredOutboundList: any[] = [];

  // Getter สำหรับใช้ใน template
  get outboundList() {
    return this.filteredOutboundList.length > 0 ? this.filteredOutboundList : this.originalOutboundList;
  }

  selectedItem: any = null;
  showDetail = false;
  header: any = {};
  
  // Modal states
  showHeaderModal = false;
  showItemModal = false;
  editingItemIndex = -1;
  
  // New item for modal
  newItem: any = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
  
  constructor(private searchConfigService: SearchConfigService) {
    // Initialize sample data
    this.originalOutboundList = [
    { 
      id: 'OUT-001', 
      customer: 'Sakura Restaurant', 
      date: '2025-09-01', 
      status: 'Shipped', 
      items: 8,
      details: {
        outboundNumber: 'OUT-001',
        status: 'Shipped',
        type: 'Normal',
        quality: 'Good',
        remark: 'จัดส่งตรงเวลา',
        soNumber: 'SO-SR-001',
        soDate: '2025-08-30',
        deliveryNote: 'DN-SR-2025-001',
        customer: {
          name: 'Sakura Restaurant',
          address: '789 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110',
          contact: 'คุณมานะ รักงาน',
          phone: '02-345-6789'
        },
        items: [
          { itemCode: 'SR-001', itemName: 'ปลาแซลมอน', qty: 50, quality: 'Good', price: 450 },
          { itemCode: 'SR-002', itemName: 'ข้าวญี่ปุ่น', qty: 100, quality: 'Good', price: 250 },
          { itemCode: 'SR-003', itemName: 'ซอสเทอริยากิ', qty: 30, quality: 'Good', price: 180 }
        ]
      }
    },
    { 
      id: 'OUT-002', 
      customer: 'Thai Express', 
      date: '2025-09-03', 
      status: 'Pending', 
      items: 5,
      details: {
        outboundNumber: 'OUT-002',
        status: 'Pending',
        type: 'Express',
        quality: 'Good',
        remark: 'รอจัดส่ง',
        soNumber: 'SO-TE-002',
        soDate: '2025-09-01',
        deliveryNote: 'DN-TE-2025-002',
        customer: {
          name: 'Thai Express',
          address: '321 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
          contact: 'คุณสมหญิง ใจเย็น',
          phone: '02-456-7890'
        },
        items: [
          { itemCode: 'TE-001', itemName: 'เครื่องแกง', qty: 100, quality: 'Good', price: 180 },
          { itemCode: 'TE-002', itemName: 'กะทิ', qty: 150, quality: 'Good', price: 65 }
        ]
      }
    }
    ];
  }

  ngOnInit() {
    this.searchConfig = this.searchConfigService.getOutboundListConfig();
  }

  handleSearchResult(result: SearchResult) {
    // Handle search result
    if (Array.isArray(result.items)) {
      this.filteredOutboundList = result.items;
    } else {
      this.filteredOutboundList = [];
    }
  }

  handleFiltersChanged(filters: SearchFilters) {
    // Handle filters changed
    console.log('Filters changed:', filters);
  }

  handleSearchResults(results: any[]) {
    // Handle search results
    this.filteredOutboundList = results;
  }

  select(item: any) {
    this.selectedItem = item;
    this.showDetail = true;
    this.header = { ...item.details };
  }

  openHeaderModal() {
    this.showHeaderModal = true;
  }

  closeHeaderModal() {
    this.showHeaderModal = false;
  }

  saveHeader() {
    console.log('Saving header', this.header);
  }

  addItem() {
    this.newItem = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
    this.editingItemIndex = -1;
    this.showItemModal = true;
  }

  editItem(index: number) {
    this.editingItemIndex = index;
    this.newItem = { ...this.header.items[index] };
    this.showItemModal = true;
  }

  saveItem() {
    if (!this.header.items) {
      this.header.items = [];
    }
    
    if (this.editingItemIndex >= 0) {
      this.header.items[this.editingItemIndex] = { ...this.newItem };
    } else {
      this.header.items.push({ ...this.newItem });
    }
    this.closeItemModal();
  }

  closeItemModal() {
    this.showItemModal = false;
    this.newItem = { itemCode: '', itemName: '', qty: 0, quality: 'Good', price: 0 };
    this.editingItemIndex = -1;
  }

  removeItem(index: number) {
    if (this.header.items) {
      this.header.items.splice(index, 1);
    }
  }

  // Getter functions for calculations
  get totalQuantity(): number {
    if (!this.header.items) return 0;
    return this.header.items.reduce((sum: number, item: any) => sum + item.qty, 0);
  }

  get totalValue(): number {
    if (!this.header.items) return 0;
    return this.header.items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0);
  }
}
