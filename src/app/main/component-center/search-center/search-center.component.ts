/**
 * ========================================
 * SEARCH CENTER COMPONENT
 * ========================================
 * 
 * Component สำหรับการค้นหาข้อมูลแบบ Universal ที่สามารถใช้งานได้ในหลายหน้า
 * โดยการกำหนด Configuration แต่ละหน้าผ่าน SearchConfigService
 * 
 * ARCHITECTURE OVERVIEW:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    SEARCH CENTER COMPONENT                      │
 * │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
 * │  │   CONFIGURABLE  │  │   USER INPUT     │  │   RESULT COUNT  │ │
 * │  │   FIELDS        │  │   HANDLERS       │  │   DISPLAY       │ │
 * │  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
 * └─────────────────────────────────────────────────────────────────┘
 *                                   │
 *                                   ▼
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                      PARENT COMPONENT                           │
 * │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
 * │  │   ORIGINAL      │  │   FILTERED       │  │   DISPLAY       │ │
 * │  │   DATA          │  │   DATA           │  │   LOGIC         │ │
 * │  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 
 * DATA FLOW EXPLANATION:
 * ======================
 * 
 * 1. INITIALIZATION
 *    - Parent ส่ง SearchConfig มาผ่าน @Input config
 *    - SearchConfig กำหนดว่าแต่ละหน้าจะมี field อะไรบ้าง, options อะไรบ้าง
 *    - Component จะ initialize filters ตาม config
 * 
 * 2. USER INTERACTION
 *    - User กรอกข้อมูลใน input fields (PO Number, Receive Number, Status, etc.)
 *    - ทุกครั้งที่มีการเปลี่ยนแปลง จะเรียก onFilterChange()
 *    - หาก hasFilters() = true จะเรียก searchData() อัตโนมัติ
 * 
 * 3. SEARCH PROCESS
 *    - searchData() จะสร้าง SearchResult object จาก filters ที่ user ใส่
 *    - ส่ง SearchResult ไปยัง parent ผ่าน @Output searchResults
 *    - Parent นำ SearchResult ไป filter ข้อมูลต้นฉบับ (originalData)
 * 
 * 4. RESULT DISPLAY
 *    - Parent filter ข้อมูลแล้วส่ง count กลับมาผ่าน @Input actualResultCount
 *    - แสดง "พบ X รายการ" ตามจำนวนจริงที่ parent filter แล้ว
 * 
 * 
 * CONFIGURATION SYSTEM:
 * =====================
 * 
 * SearchConfig กำหนดการทำงานของแต่ละหน้า:
 * 
 * - enabledFields: กำหนดว่า field ไหนแสดง field ไหนซ่อน
 *   เช่น: หน้า PO แสดง poNumber, skuCode แต่ซ่อน receiveNumber
 * 
 * - statusOptions/typeOptions: ตัวเลือกใน dropdown
 *   เช่น: หน้า Receive มี "รับแล้ว", "รอดำเนินการ"
 *        หน้า Outbound มี "จัดส่งแล้ว", "กำลังเบิก"
 * 
 * - placeholders: ข้อความ hint ใน input fields
 * 
 * - defaultFilters: ค่าเริ่มต้น (ปัจจุบันไม่ใช้เพื่อให้แสดงข้อมูลทั้งหมดก่อน)
 * 
 * 
 * PARENT COMPONENT INTEGRATION:
 * =============================
 * 
 * Parent Component (เช่น ReceiveListComponent) ต้องมี:
 * 
 * 1. Data Structure:
 *    - originalData: ข้อมูลต้นฉบับ
 *    - filteredData: ข้อมูลที่ filter แล้ว
 *    - getter displayData(): ตรรกะการแสดงผล
 * 
 * 2. Event Handlers:
 *    - handleSearchResults(results: SearchResult[])
 *      * รับ search criteria จาก search center
 *      * filter originalData ด้วย criteria
 *      * update filteredData
 * 
 * 3. Template Binding:
 *    <app-search-center 
 *      [config]="searchConfig"
 *      [actualResultCount]="displayData.length"
 *      (searchResults)="handleSearchResults($event)">
 *    </app-search-center>
 * 
 * 
 * REUSABILITY PATTERN:
 * ====================
 * 
 * Component นี้ใช้งานได้ในหลายหน้าโดยการเปลี่ยน config:
 * 
 * - Receive List: searchConfigService.getReceiveListConfig()
 * - PO List: searchConfigService.getPOListConfig()
 * - Outbound List: searchConfigService.getOutboundListConfig()
 * - Inventory: searchConfigService.getInventoryConfig()
 * 
 * 
 * EXAMPLE FILTER LOGIC IN PARENT:
 * ================================
 * 
 * handleSearchResults(results: SearchResult[]) {
 *   if (results.length > 0) {
 *     const criteria = results[0];
 *     this.filteredData = this.originalData.filter(item => {
 *       let match = true;
 *       if (criteria.receiveNumber) {
 *         match = match && item.id.includes(criteria.receiveNumber);
 *       }
 *       if (criteria.status) {
 *         match = match && item.status === criteria.status;
 *       }
 *       return match;
 *     });
 *   } else {
 *     this.filteredData = [];
 *   }
 * }
 * 
 */

import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../service/search.service';
import { SearchConfig } from '../../../service/search-config.service';

/**
 * INTERFACE: SearchFilters
 * ========================
 * Object สำหรับเก็บเงื่อนไขการค้นหาที่ user กรอก
 * มี [key: string]: any เพื่อรองรับ dynamic filters
 */
export interface SearchFilters {
  poNumber?: string;           // เลขที่ใบสั่งซื้อ
  receiveNumber?: string;      // เลขที่ใบรับสินค้า
  outboundNumber?: string;     // เลขที่ใบจ่ายสินค้า
  inventoryCode?: string;      // รหัสคลังสินค้า
  skuCode?: string;           // รหัสสินค้า
  customerCode?: string;       // รหัสลูกค้า
  status?: string;            // สถานะ
  type?: string;              // ประเภท
  dateFrom?: string;          // วันที่เริ่มต้น
  dateTo?: string;            // วันที่สิ้นสุด
  vendor?: string;            // ผู้จำหน่าย
  [key: string]: any;         // Dynamic filters สำหรับขยายเพิ่มเติม
}

/**
 * INTERFACE: SearchResult
 * =======================
 * Object ที่ส่งกลับไปยัง parent component เป็น search criteria
 * Parent จะใช้ object นี้มา filter ข้อมูลต้นฉบับ
 */
export interface SearchResult {
  id: string;                 // ID หลัก
  poNumber?: string;          // เลขที่ PO (ถ้ามี)
  receiveNumber?: string;     // เลขที่ใบรับ (ถ้ามี)
  vendor: string;             // ผู้จำหน่าย/ลูกค้า
  date: string;               // วันที่
  status: string;             // สถานะ
  type: string;               // ประเภท
  items: number;              // จำนวนรายการ (ไม่ใช้ในการ filter)
  totalValue: number;         // มูลค่ารวม (ไม่ใช้ในการ filter)
}

@Component({
  selector: 'app-search-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-center.component.html',
  styleUrl: './search-center.component.scss'
})
export class SearchCenterComponent implements OnInit {
  private searchService = inject(SearchService);  // Service สำหรับเรียก API (ยังไม่ได้ใช้งาน)
  
  // ===========================
  // INPUT/OUTPUT PROPERTIES
  // ===========================
  
  @Input() config!: SearchConfig;              // Configuration จาก parent กำหนดว่าหน้านี้แสดง field อะไรบ้าง
  @Input() inline: boolean = true;             // แสดงแบบ inline หรือ modal (ปัจจุบันใช้ inline)
  @Input() actualResultCount: number = 0;     // จำนวนผลลัพธ์จริงจาก parent หลัง filter แล้ว

  @Output() searchResult = new EventEmitter<SearchResult>();     // ส่ง result ตัวเดียว (ไม่ได้ใช้)
  @Output() filtersChanged = new EventEmitter<SearchFilters>();  // ส่ง filters object (ไม่ได้ใช้หลัก)
  @Output() searchResults = new EventEmitter<SearchResult[]>();  // ส่ง search criteria ไป parent

  // ===========================
  // COMPONENT STATE
  // ===========================
  
  filters: SearchFilters = {};        // เก็บค่าที่ user กรอกใน form
  results: SearchResult[] = [];       // เก็บ search criteria ที่สร้างแล้ว (ไม่ใช่ผลลัพธ์จริง)
  isSearching: boolean = false;       // สถานะกำลังค้นหา
  showAdvancedFilters: boolean = false; // แสดง/ซ่อน advanced filters

  // ===========================
  // LIFECYCLE METHODS
  // ===========================
  
  ngOnInit() {
    if (this.config) {
      this.initializeFilters();
      // ไม่ต้อง auto search ตอน init เพื่อให้แสดงข้อมูลเดิมก่อน
    }
  }

  // ===========================
  // INITIALIZATION METHODS
  // ===========================
  
  /**
   * สร้าง filters object เริ่มต้นจาก config
   * รวม defaultFilters ถ้ามี (ปัจจุบันไม่มี default เพื่อแสดงข้อมูลทั้งหมด)
   */
  private initializeFilters() {
    this.filters = {
      poNumber: '',
      receiveNumber: '',
      outboundNumber: '',
      inventoryCode: '',
      skuCode: '',
      customerCode: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      vendor: '',
      ...this.config.defaultFilters  // รวม default filters จาก config (ถ้ามี)
    };
  }

  // ===========================
  // GETTER METHODS (สำหรับ Template)
  // ===========================
  
  /** ดึง enabled fields จาก config เพื่อกำหนดว่า field ไหนแสดง */
  get enabledFields() {
    return this.config?.enabledFields || {};
  }

  /** ดึง status options สำหรับ dropdown */
  get statusOptions() {
    return this.config?.statusOptions || [];
  }

  /** ดึง type options สำหรับ dropdown */
  get typeOptions() {
    return this.config?.typeOptions || [];
  }

  /** ดึง vendor options สำหรับ dropdown */
  get vendorOptions() {
    return this.config?.vendorOptions || [];
  }

  /** ดึง placeholders สำหรับ input hints */
  get placeholders() {
    return this.config?.placeholders || {};
  }

  // ===========================
  // MOCK DATA (สำหรับ Demo - ไม่ได้ใช้ในระบบจริง)
  // ===========================
  
  mockResults: SearchResult[] = [
    {
      id: 'RCV-2024-001',
      poNumber: 'PO-2024-001',
      receiveNumber: 'RCV-2024-001',
      vendor: 'บริษัท เอ จำกัด',
      date: '2024-01-15',
      status: 'Received',
      type: 'Normal',
      items: 15,
      totalValue: 25000
    },
    {
      id: 'RCV-2024-002',
      poNumber: 'PO-2024-002',
      receiveNumber: 'RCV-2024-002',
      vendor: 'บริษัท บี จำกัด',
      date: '2024-01-16',
      status: 'Pending',
      type: 'Import',
      items: 8,
      totalValue: 18000
    }
  ];

  // ===========================
  // USER INTERACTION METHODS
  // ===========================
  
  /**
   * จัดการการเลือก result (ไม่ได้ใช้ในระบบปัจจุบัน)
   */
  selectResult(result: SearchResult) {
    this.searchResult.emit(result);
  }

  /**
   * ล้างตัวกรองทั้งหมดและส่งสัญญาณให้ parent แสดงข้อมูลเดิม
   */
  clearFilters() {
    if (this.config) {
      this.initializeFilters();
    }
    this.results = [];
    this.searchResults.emit([]); // ส่งผลลัพธ์ว่างเปล่าเพื่อแสดงข้อมูลเดิม
  }

  /**
   * สลับการแสดง/ซ่อน advanced filters
   */
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // ===========================
  // CORE SEARCH METHODS
  // ===========================
  
  /**
   * METHOD หลักสำหรับการค้นหา
   * =============================
   * 
   * วิธีการทำงาน:
   * 1. สร้าง SearchResult object จาก filters ที่ user กรอก
   * 2. ส่ง SearchResult ไปยัง parent component ผ่าง searchResults output
   * 3. Parent จะนำ SearchResult ไปใช้ filter ข้อมูลต้นฉบับ
   * 
   * หมายเหตุ: ไม่ได้เรียก API จริง แต่ใช้เป็น search criteria แทน
   */
  searchData() {
    this.isSearching = true;
    
    // สร้าง search criteria จาก filters ที่มีค่า
    const activeCriteria: SearchResult = {
      id: '',
      vendor: this.filters.vendor || '',
      date: this.filters.dateFrom || '',
      status: this.filters.status || '',
      type: this.filters.type || '',
      items: 0,            // ไม่ใช้ในการ filter
      totalValue: 0        // ไม่ใช้ในการ filter
    };

    // เพิ่ม criteria ตามประเภทของ search
    if (this.filters.poNumber) {
      activeCriteria.poNumber = this.filters.poNumber;
    }
    if (this.filters.receiveNumber) {
      activeCriteria.receiveNumber = this.filters.receiveNumber;
    }

    // ส่ง criteria ไปให้ parent component ใช้ filter ข้อมูลจริง
    this.results = [activeCriteria]; // ส่งเป็น array เพื่อให้ตรงกับ interface
    this.isSearching = false;
    this.filtersChanged.emit(this.filters);
    this.searchResults.emit(this.results); // ส่ง criteria ไปยัง parent component
  }

  /**
   * จัดการการเปลี่ยนแปลง filters แต่ละ field
   * =========================================
   * 
   * เรียกทุกครั้งที่ user พิมพ์หรือเลือกค่าใน form
   * - ถ้ามี filters จะเรียก searchData() อัตโนมัติ
   * - ถ้าไม่มี filters จะล้างผลลัพธ์และส่งสัญญาณให้แสดงข้อมูลเดิม
   */
  onFilterChange() {
    // Auto search when filters change
    if (this.hasFilters()) {
      this.searchData();
    } else {
      this.results = [];
      this.searchResults.emit([]); // ส่งผลลัพธ์ว่างเปล่าเพื่อแสดงข้อมูลเดิม
    }
  }

  /**
   * ตรวจสอบว่ามี filters หรือไม่
   * ==============================
   * 
   * return true ถ้ามี field ใดมีค่า (ไม่ใช่ string ว่าง)
   */
  hasFilters(): boolean {
    return Object.values(this.filters).some(value => value && value.toString().trim() !== '');
  }
}
