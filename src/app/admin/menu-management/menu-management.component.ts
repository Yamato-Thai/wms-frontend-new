import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainService, MainMenuDto, CreateMainMenuDto, UpdateMainMenuDto } from '../../service/main.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.scss']
})
export class MenuManagementComponent implements OnInit {
  menus: MainMenuDto[] = [];
  hierarchicalMenus: MainMenuDto[] = [];
  filteredMenus: MainMenuDto[] = [];
  filteredHierarchicalMenus: MainMenuDto[] = [];
  parentMenus: MainMenuDto[] = [];

  menuForm: FormGroup;
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  isChildMode = false; // เพิ่มโหมดสำหรับสร้างลูก
  currentMenuId?: number;
  parentMenuForChild?: MainMenuDto; // เก็บข้อมูล parent สำหรับสร้างลูก
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedParent: number | null = null;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  
  // Display mode: 'table' หรือ 'tree'
  displayMode: 'table' | 'tree' = 'tree';
  expandedNodes: Set<number> = new Set();

  constructor(
    private mainService: MainService,
    private fb: FormBuilder
  ) {
    this.menuForm = this.fb.group({
      parent: [null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(500)],
      isActive: [true],
      link: ['', Validators.maxLength(500)],
      sequent: [0],
      image: ['', Validators.maxLength(500)],
      doMain: ['WMS-Main', Validators.maxLength(200)]
    });
  }

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.isLoading = true;
    this.errorMessage = '';

    // ใช้ hierarchical API เป็นหลัก
    this.mainService.getHierarchicalMenus().subscribe({
      next: (hierarchicalMenus) => {
        console.log('🌳 Hierarchical menus loaded:', hierarchicalMenus);
        this.menus = this.flattenHierarchy(hierarchicalMenus);
        this.hierarchicalMenus = hierarchicalMenus;
        this.filteredHierarchicalMenus = hierarchicalMenus; // เริ่มต้นด้วยข้อมูลทั้งหมด
        this.parentMenus = this.menus.filter(m => !m.parent || m.parent === 0);
        this.applyFilters();
        this.isLoading = false;
        this.successMessage = 'Menus loaded successfully';
        this.clearMessages();
        // เริ่มต้นแบบหุบไว้ทั้งหมด
        this.collapseAllNodes();
      },
      error: (error) => {
        console.error('❌ Hierarchical API failed, using flat API fallback:', error);
        // Fallback to flat API
        this.mainService.getAllMenus().subscribe({
          next: (flatMenus) => {
            this.menus = flatMenus.sort((a, b) => (a.sequent || 0) - (b.sequent || 0));
            this.hierarchicalMenus = this.buildHierarchyFromFlat(flatMenus);
            this.filteredHierarchicalMenus = this.hierarchicalMenus; // เริ่มต้นด้วยข้อมูลทั้งหมด
            this.parentMenus = flatMenus.filter(m => !m.parent || m.parent === 0);
            this.applyFilters();
            this.isLoading = false;
            this.successMessage = 'Menus loaded successfully (flat API fallback)';
            this.clearMessages();
            // เริ่มต้นแบบหุบไว้ทั้งหมด
            this.collapseAllNodes();
          },
          error: (fallbackError) => {
            console.error('Error loading menus:', fallbackError);
            this.errorMessage = `Failed to load menus: ${fallbackError.message}`;
            this.isLoading = false;
          }
        });
      }
    });
  }

  applyFilters() {
    // Filter flat menus for table view
    this.filteredMenus = this.menus.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (menu.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesParent = this.selectedParent === null || menu.parent === this.selectedParent;

      const matchesStatus = this.statusFilter === 'all' ||
                           (this.statusFilter === 'active' && menu.isActive) ||
                           (this.statusFilter === 'inactive' && !menu.isActive);

      return matchesSearch && matchesParent && matchesStatus;
    });

    // Filter hierarchical menus for tree view
    this.filteredHierarchicalMenus = this.filterHierarchical(this.hierarchicalMenus);
  }

  private filterHierarchical(menus: MainMenuDto[]): MainMenuDto[] {
    return menus.map(menu => {
      const matchesSearch = this.searchTerm === '' || 
                           menu.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (menu.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
                           (this.statusFilter === 'active' && menu.isActive) ||
                           (this.statusFilter === 'inactive' && !menu.isActive);

      // Filter children recursively
      const filteredChildren = menu.childMenus ? this.filterHierarchical(menu.childMenus) : [];
      
      // Include parent if it matches OR if any child matches
      const hasMatchingChildren = filteredChildren.length > 0;
      const shouldInclude = (matchesSearch && matchesStatus) || hasMatchingChildren;

      if (shouldInclude) {
        return {
          ...menu,
          childMenus: filteredChildren
        };
      }
      return null;
    }).filter(menu => menu !== null) as MainMenuDto[];
  }

  onSearchChange() {
    this.applyFilters();
  }

  onParentFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  showCreateForm() {
    this.isEditMode = false;
    this.isChildMode = false;
    this.isFormVisible = true;
    this.currentMenuId = undefined;
    this.parentMenuForChild = undefined;
    this.errorMessage = '';
    this.menuForm.reset({
      parent: 0, // ใส่ 0 เสมอสำหรับ root menu
      name: '',
      description: '',
      isActive: true,
      link: '',
      sequent: this.getNextSequence(),
      image: '',
      doMain: 'WMS-Main'
    });
  }

  showCreateChildForm(parentMenu: MainMenuDto) {
    this.isEditMode = false;
    this.isChildMode = true;
    this.isFormVisible = true;
    this.currentMenuId = undefined;
    this.parentMenuForChild = parentMenu;
    this.errorMessage = '';
    this.menuForm.reset({
      parent: parentMenu.id,
      name: '',
      description: '',
      isActive: true,
      link: '',
      sequent: this.getNextChildSequence(parentMenu.id),
      image: '',
      doMain: 'WMS-Main'
    });
    
    // ขยาย parent node เพื่อดูลูกที่เพิ่งสร้าง
    this.expandedNodes.add(parentMenu.id);
  }

  editMenu(menu: MainMenuDto) {
    this.isEditMode = true;
    this.isChildMode = false;
    this.isFormVisible = true;
    this.currentMenuId = menu.id;
    this.parentMenuForChild = undefined;
    this.errorMessage = '';

    this.menuForm.patchValue({
      parent: menu.parent,
      name: menu.name,
      description: menu.description,
      isActive: menu.isActive,
      link: menu.link,
      sequent: menu.sequent,
      image: menu.image,
      doMain: menu.doMain
    });
  }

  saveMenu() {
    if (this.menuForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const formValue = this.menuForm.value;

    if (this.isEditMode && this.currentMenuId) {
      const updateDto: UpdateMainMenuDto = {
        id: this.currentMenuId,
        ...formValue
      };

      this.mainService.updateMenu(this.currentMenuId, updateDto).subscribe({
        next: () => {
          this.loadMenus();
          this.hideForm();
          this.successMessage = 'Menu updated successfully';
          this.clearMessages();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating menu:', error);
          this.errorMessage = `Failed to update menu: ${error.message}`;
          this.isLoading = false;
        }
      });
    } else {
      const createDto: CreateMainMenuDto = formValue;

      this.mainService.createMenu(createDto).subscribe({
        next: () => {
          this.loadMenus();
          this.hideForm();
          this.successMessage = 'Menu created successfully';
          this.clearMessages();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating menu:', error);
          this.errorMessage = `Failed to create menu: ${error.message}`;
          this.isLoading = false;
        }
      });
    }
  }

  deleteMenu(menu: MainMenuDto) {
    if (confirm(`Are you sure you want to delete "${menu.name}"?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.mainService.deleteMenu(menu.id).subscribe({
        next: () => {
          this.loadMenus();
          this.successMessage = 'Menu deleted successfully';
          this.clearMessages();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting menu:', error);
          this.errorMessage = `Failed to delete menu: ${error.message}`;
          this.isLoading = false;
        }
      });
    }
  }

  hideForm() {
    this.isFormVisible = false;
    this.isChildMode = false;
    this.parentMenuForChild = undefined;
    this.menuForm.reset();
    this.errorMessage = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.menuForm.controls).forEach(key => {
      const control = this.menuForm.get(key);
      control?.markAsTouched();
    });
  }

  private getNextSequence(): number {
    const maxSequence = Math.max(...this.menus.map(m => m.sequent || 0), 0);
    return maxSequence + 1;
  }

  private getNextChildSequence(parentId: number): number {
    const siblings = this.menus.filter(m => m.parent === parentId);
    const maxSequence = Math.max(...siblings.map(m => m.sequent || 0), 0);
    return maxSequence + 1;
  }

  private clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return 'Root';
    const parent = this.menus.find(m => m.id === parentId);
    return parent ? parent.name : 'Unknown';
  }

  getFieldError(fieldName: string): string {
    const control = this.menuForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['maxlength']) return `${fieldName} is too long`;
    }
    return '';
  }

  // Hierarchical helper methods
  private flattenHierarchy(hierarchicalMenus: MainMenuDto[]): MainMenuDto[] {
    const flattened: MainMenuDto[] = [];
    
    const flatten = (menus: MainMenuDto[]) => {
      for (const menu of menus) {
        flattened.push(menu);
        if (menu.childMenus && menu.childMenus.length > 0) {
          flatten(menu.childMenus);
        }
      }
    };
    
    flatten(hierarchicalMenus);
    return flattened;
  }

  private buildHierarchyFromFlat(flatMenus: MainMenuDto[]): MainMenuDto[] {
    const menuMap = new Map<number, MainMenuDto>();
    const rootMenus: MainMenuDto[] = [];
    
    // สร้าง map และเตรียม childMenus array
    flatMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, childMenus: [] });
    });
    
    // สร้าง hierarchy
    flatMenus.forEach(menu => {
      const menuItem = menuMap.get(menu.id)!;
      if (!menu.parent || menu.parent === 0) {
        rootMenus.push(menuItem);
      } else {
        const parent = menuMap.get(menu.parent);
        if (parent) {
          if (!parent.childMenus) parent.childMenus = [];
          parent.childMenus.push(menuItem);
        }
      }
    });
    
    return rootMenus;
  }

  // Display mode controls
  toggleDisplayMode() {
    this.displayMode = this.displayMode === 'table' ? 'tree' : 'table';
  }

  toggleNode(nodeId: number) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  isNodeExpanded(nodeId: number): boolean {
    return this.expandedNodes.has(nodeId);
  }

  expandAllNodes() {
    // ขยายเฉพาะ root level เท่านั้น
    if (this.hierarchicalMenus) {
      this.hierarchicalMenus.forEach(menu => {
        this.expandedNodes.add(menu.id);
      });
    }
  }

  collapseAllNodes() {
    this.expandedNodes.clear();
  }
}
