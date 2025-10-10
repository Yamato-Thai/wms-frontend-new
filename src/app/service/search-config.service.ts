import { Injectable } from '@angular/core';

export interface SearchConfig {
  title: string;
  searchType: 'PO' | 'RECEIVE' | 'INVENTORY' | 'OUTBOUND' | 'ALL';
  enabledFields: {
    poNumber?: boolean;
    receiveNumber?: boolean;
    outboundNumber?: boolean;
    inventoryCode?: boolean;
    skuCode?: boolean;
    customerCode?: boolean;
  };
  statusOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  vendorOptions: { value: string; label: string }[];
  defaultFilters?: any;
  apiEndpoint?: string;
  placeholders?: {
    poNumber?: string;
    receiveNumber?: string;
    outboundNumber?: string;
    inventoryCode?: string;
    skuCode?: string;
    customerCode?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchConfigService {

  constructor() { }

  // Config for Outbound List page
  getOutboundListConfig(): SearchConfig {
    return {
      title: 'ค้นหารายการจัดส่งสินค้า',
      searchType: 'OUTBOUND',
      enabledFields: {
        poNumber: false,
        receiveNumber: false,
        skuCode: true,
        outboundNumber: true,
        inventoryCode: false,
        customerCode: true
      },
      statusOptions: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'Shipped', label: 'จัดส่งแล้ว' },
        { value: 'Pending', label: 'รอดำเนินการ' }
      ],
      typeOptions: [
        { value: '', label: 'ประเภททั้งหมด' },
        { value: 'Normal', label: 'ปกติ' },
        { value: 'Express', label: 'ด่วน' }
      ],
      vendorOptions: [
        { value: '', label: 'ลูกค้าทั้งหมด' },
        { value: 'Sakura Restaurant', label: 'Sakura Restaurant' },
        { value: 'Thai Express', label: 'Thai Express' }
      ],
      placeholders: {
        outboundNumber: 'เลขที่เอกสารจัดส่ง',
        skuCode: 'รหัสสินค้า',
        customerCode: 'รหัสลูกค้า'
      }
    };
  }

  // Config for Receive List page
  getReceiveListConfig(): SearchConfig {
    return {
      title: 'ค้นหารายการรับสินค้า',
      searchType: 'RECEIVE',
      enabledFields: {
        poNumber: true,
        receiveNumber: true,
        skuCode: false,
        outboundNumber: false,
        inventoryCode: false,
        customerCode: false
      },
      statusOptions: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'Received', label: 'รับแล้ว' },
        { value: 'Pending', label: 'รอดำเนินการ' }
      ],
      typeOptions: [
        { value: '', label: 'ประเภททั้งหมด' },
        { value: 'Normal', label: 'ปกติ' },
        { value: 'Import', label: 'นำเข้า' },
        { value: 'Return', label: 'คืนสินค้า' }
      ],
      vendorOptions: [
        { value: '', label: 'ผู้จำหน่ายทั้งหมด' },
        { value: 'Company A', label: 'บริษัท เอ จำกัด' },
        { value: 'Company B', label: 'บริษัท บี จำกัด' }
      ],
      defaultFilters: {
        // ไม่มี default filter เพื่อให้แสดงข้อมูลทั้งหมดตอนเริ่มต้น
      },
      apiEndpoint: '/api/search/receive-documents',
      placeholders: {
        poNumber: 'ระบุเลขที่ PO...',
        receiveNumber: 'ระบุเลขที่ใบรับ...'
      }
    };
  }

  // Config for PO List page
  getPOListConfig(): SearchConfig {
    return {
      title: 'ค้นหาใบสั่งซื้อ',
      searchType: 'PO',
      enabledFields: {
        poNumber: true,
        receiveNumber: false,
        skuCode: true,
        outboundNumber: false,
        inventoryCode: false,
        customerCode: false
      },
      statusOptions: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'Draft', label: 'ร่าง' },
        { value: 'Approved', label: 'อนุมัติแล้ว' },
        { value: 'Sent', label: 'ส่งแล้ว' },
        { value: 'Received', label: 'รับแล้ว' }
      ],
      typeOptions: [
        { value: '', label: 'ประเภททั้งหมด' },
        { value: 'Normal', label: 'ปกติ' },
        { value: 'Urgent', label: 'ด่วน' },
        { value: 'Special', label: 'พิเศษ' }
      ],
      vendorOptions: [
        { value: '', label: 'ผู้จำหน่ายทั้งหมด' },
        { value: 'Company A', label: 'บริษัท เอ จำกัด' },
        { value: 'Company B', label: 'บริษัท บี จำกัด' }
      ],
      apiEndpoint: '/api/search/purchase-orders',
      placeholders: {
        poNumber: 'ระบุเลขที่ PO...',
        skuCode: 'ระบุรหัสสินค้า...'
      }
    };
  }

  // Config for Inventory page
  getInventoryConfig(): SearchConfig {
    return {
      title: 'ค้นหาสินค้าคงคลัง',
      searchType: 'INVENTORY',
      enabledFields: {
        poNumber: false,
        receiveNumber: false,
        outboundNumber: false,
        inventoryCode: true,
        skuCode: true,
        customerCode: false
      },
      statusOptions: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'Available', label: 'พร้อมใช้' },
        { value: 'Reserved', label: 'จอง' },
        { value: 'OnHold', label: 'พักสินค้า' },
        { value: 'Damaged', label: 'เสียหาย' }
      ],
      typeOptions: [
        { value: '', label: 'ประเภททั้งหมด' },
        { value: 'Raw', label: 'วัตถุดิบ' },
        { value: 'Finished', label: 'สินค้าสำเร็จรูป' },
        { value: 'Component', label: 'ชิ้นส่วน' }
      ],
      vendorOptions: [],
      apiEndpoint: '/api/search/inventory',
      placeholders: {
        inventoryCode: 'ระบุรหัสคลัง...',
        skuCode: 'ระบุรหัสสินค้า...'
      }
    };
  }

  // Config for Global Search (All modules)
  getGlobalSearchConfig(): SearchConfig {
    return {
      title: 'ค้นหาข้อมูลทั้งหมด',
      searchType: 'ALL',
      enabledFields: {
        poNumber: true,
        receiveNumber: true,
        outboundNumber: true,
        inventoryCode: true,
        skuCode: true,
        customerCode: true
      },
      statusOptions: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'Active', label: 'ใช้งาน' },
        { value: 'Inactive', label: 'ไม่ใช้งาน' },
        { value: 'Pending', label: 'รอดำเนินการ' }
      ],
      typeOptions: [
        { value: '', label: 'ประเภททั้งหมด' },
        { value: 'PO', label: 'ใบสั่งซื้อ' },
        { value: 'RECEIVE', label: 'ใบรับสินค้า' },
        { value: 'OUTBOUND', label: 'ใบจ่ายสินค้า' },
        { value: 'INVENTORY', label: 'สินค้าคงคลัง' }
      ],
      vendorOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'Company A', label: 'บริษัท เอ จำกัด' },
        { value: 'Company B', label: 'บริษัท บี จำกัด' },
        { value: 'Customer A', label: 'ลูกค้า เอ' },
        { value: 'Customer B', label: 'ลูกค้า บี' }
      ],
      apiEndpoint: '/api/search/global',
      placeholders: {
        poNumber: 'เลขที่ PO...',
        receiveNumber: 'เลขที่ใบรับ...',
        outboundNumber: 'เลขที่ใบจ่าย...',
        inventoryCode: 'รหัสคลัง...',
        skuCode: 'รหัสสินค้า...',
        customerCode: 'รหัสลูกค้า...'
      }
    };
  }
}
