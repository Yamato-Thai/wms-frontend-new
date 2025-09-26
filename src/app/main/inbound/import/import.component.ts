import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces for type safety
interface UploadedFile {
  name: string;
  size: number;
  recordCount: number;
  status: string;
}

interface PreviewData {
  documentNumber: string;
  supplier: string;
  date: Date;
  itemCount: number;
  totalValue: number;
  status: 'Valid' | 'Warning' | 'Error';
}

interface ValidationMessage {
  row: number;
  message: string;
}

interface FileDefinition {
  id: string;
  name: string;
  description: string;
  requiredColumns: string;
  dateFormat: string;
  notes: string;
  templateUrl?: string;
}

@Component({
  selector: 'app-import',
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {
  
  // Upload related properties
  isUploading = false;
  uploadProgress = 0;
  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;
  
  // Definition related properties
  selectedDefinition = '';
  availableDefinitions: FileDefinition[] = [];
  
  // Data preview properties
  previewData: PreviewData[] = [];
  
  // Validation properties
  validationErrors: ValidationMessage[] = [];
  validationWarnings: ValidationMessage[] = [];
  
  // Processing state
  isProcessing = false;
  
  constructor() {
    this.loadAvailableDefinitions();
  }
  
  // Computed properties
  get validRecords(): number {
    return this.previewData.filter(item => item.status === 'Valid').length;
  }
  
  get errorRecords(): number {
    return this.previewData.filter(item => item.status === 'Error').length;
  }
  
  // Methods
  private loadAvailableDefinitions() {
    // Mock data for available file definitions
    this.availableDefinitions = [
      {
        id: 'receiving_standard',
        name: 'รับสินค้าทั่วไป',
        description: 'รูปแบบมาตรฐานสำหรับการรับสินค้าจากผู้จำหน่าย',
        requiredColumns: 'เลขที่เอกสาร, ผู้จำหน่าย, รหัสสินค้า, ชื่อสินค้า, จำนวน, ราคา',
        dateFormat: 'dd/mm/yyyy',
        notes: 'ไฟล์ต้องมีหัวคอลัมน์ในแถวแรก',
        templateUrl: '/templates/receiving_standard.xlsx'
      },
      {
        id: 'receiving_import',
        name: 'รับสินค้านำเข้า',
        description: 'รูปแบบสำหรับการรับสินค้านำเข้าจากต่างประเทศ',
        requiredColumns: 'Invoice No, Supplier, Item Code, Description, Quantity, Unit Price, Currency',
        dateFormat: 'mm/dd/yyyy',
        notes: 'รองรับหลายสกุลเงิน และต้องระบุ Country of Origin',
        templateUrl: '/templates/receiving_import.xlsx'
      },
      {
        id: 'receiving_return',
        name: 'รับคืนสินค้า',
        description: 'รูปแบบสำหรับการรับคืนสินค้าจากลูกค้า',
        requiredColumns: 'Return No, Customer, Item Code, Return Quantity, Reason, Condition',
        dateFormat: 'yyyy-mm-dd',
        notes: 'ต้องระบุสาเหตุการคืนและสภาพสินค้า',
        templateUrl: '/templates/receiving_return.xlsx'
      },
      {
        id: 'receiving_transfer',
        name: 'รับโอนสินค้า',
        description: 'รูปแบบสำหรับการรับโอนสินค้าระหว่างคลังสินค้า',
        requiredColumns: 'Transfer No, From Location, Item Code, Transfer Quantity, Batch No',
        dateFormat: 'dd-mm-yyyy',
        notes: 'ระบุ Batch Number และ Location ต้นทาง-ปลายทาง',
        templateUrl: '/templates/receiving_transfer.xlsx'
      }
    ];
  }

  onDefinitionChange() {
    // Reset uploaded files when definition changes
    this.uploadedFiles = [];
    this.previewData = [];
    this.validationErrors = [];
    this.validationWarnings = [];
    
    console.log('Selected definition:', this.selectedDefinition);
  }

  getSelectedDefinitionDetails(): FileDefinition | undefined {
    return this.availableDefinitions.find(def => def.id === this.selectedDefinition);
  }

  downloadDefinitionTemplate() {
    const definition = this.getSelectedDefinitionDetails();
    if (definition) {
      console.log('Downloading template for:', definition.name);
      // In real implementation, would download the actual template file
      alert(`ดาวน์โหลดเทมเพลตสำหรับ: ${definition.name}`);
    }
  }

  showDefinitionRequiredMessage() {
    alert('กรุณาเลือกรูปแบบการอ่านข้อมูลก่อนอัปโหลดไฟล์');
  }

  onFileSelected(eventOrFiles: any) {
    if (!this.selectedDefinition) {
      this.showDefinitionRequiredMessage();
      return;
    }

    let files: FileList;
    
    // Handle both file input change event and drag & drop
    if (eventOrFiles && eventOrFiles.target && eventOrFiles.target.files) {
      // File input change event
      files = eventOrFiles.target.files;
    } else if (eventOrFiles && eventOrFiles.length) {
      // Drag & drop FileList
      files = eventOrFiles;
    } else {
      return;
    }
    
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }
  
  // Drag and Drop handlers
  onDragOver(event: DragEvent) {
    if (!this.selectedDefinition) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    if (!this.selectedDefinition) {
      this.showDefinitionRequiredMessage();
      return;
    }
    
    if (event.dataTransfer?.files) {
      this.onFileSelected(event.dataTransfer.files);
    }
  }
  
  private processFiles(files: FileList) {
    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(progressInterval);
        this.isUploading = false;
        
        // Add uploaded files (mock data)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          this.uploadedFiles.push({
            name: file.name,
            size: Math.round(file.size / 1024), // Convert to KB
            recordCount: Math.floor(Math.random() * 100) + 1,
            status: 'success'
          });
        }
        
        // Generate mock preview data
        this.generateMockPreviewData();
      }
    }, 300);
  }
  
  private generateMockPreviewData() {
    // Generate mock preview data for demonstration
    this.previewData = [
      {
        documentNumber: 'RCV-2024-001',
        supplier: 'บริษัท ABC จำกัด',
        date: new Date('2024-01-15'),
        itemCount: 25,
        totalValue: 125000,
        status: 'Valid'
      },
      {
        documentNumber: 'RCV-2024-002',
        supplier: 'บริษัท XYZ จำกัด',
        date: new Date('2024-01-16'),
        itemCount: 15,
        totalValue: 75000,
        status: 'Warning'
      },
      {
        documentNumber: 'RCV-2024-003',
        supplier: 'บริษัท DEF จำกัด',
        date: new Date('2024-01-17'),
        itemCount: 30,
        totalValue: 180000,
        status: 'Valid'
      }
    ];
    
    // Generate mock validation messages
    this.validationWarnings = [
      {
        row: 2,
        message: 'ผู้จำหน่ายนี้ไม่อยู่ในระบบ จะถูกเพิ่มเป็นผู้จำหน่ายใหม่'
      }
    ];
    
    this.validationErrors = [];
  }
  
  downloadTemplate() {
    if (this.selectedDefinition) {
      this.downloadDefinitionTemplate();
    } else {
      // Show generic template selection
      console.log('Download generic template or show definition selection');
      alert('กรุณาเลือกรูปแบบการอ่านข้อมูลก่อน หรือดาวน์โหลดเทมเพลตทั่วไป');
    }
  }
  
  showHelp() {
    // Implementation for showing help/manual
    console.log('Show help');
  }
  
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    if (this.uploadedFiles.length === 0) {
      this.previewData = [];
      this.validationErrors = [];
      this.validationWarnings = [];
    }
  }
  
  editData() {
    console.log('Edit data');
  }
  
  confirmData() {
    console.log('Confirm data');
  }
  
  previewBeforeSave() {
    console.log('Preview before save');
  }
  
  importData() {
    if (this.errorRecords === 0) {
      this.isProcessing = true;
      // Simulate processing
      setTimeout(() => {
        this.isProcessing = false;
        alert(`นำเข้าข้อมูลสำเร็จ ${this.validRecords} รายการ`);
      }, 2000);
    }
  }
  
  cancel() {
    // Reset all data
    this.uploadedFiles = [];
    this.previewData = [];
    this.validationErrors = [];
    this.validationWarnings = [];
    this.isUploading = false;
    this.uploadProgress = 0;
  }
}
