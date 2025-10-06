// menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MenuItem } from '../model/mainmenu.model';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface MainMenuDto {
  id: number;
  parent: number | null;
  name: string;
  description?: string;
  isActive: boolean;
  link?: string;
  sequent?: number;
  image?: string;
  doMain?: string;
  parentName?: string;
  childMenus?: MainMenuDto[];
}

export interface CreateMainMenuDto {
  parent?: number | null;
  name: string;
  description?: string;
  isActive: boolean;
  link?: string;
  sequent?: number;
  image?: string;
  doMain?: string;
}

export interface UpdateMainMenuDto extends CreateMainMenuDto {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class MainService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // เดิม - ใช้สำหรับดึงเมนูแบบ hierarchical
  getMenu(): Observable<MenuItem[]> {
    console.log('🔥 Starting getMenu() - using hierarchical API first');
    console.log('🌐 Calling:', `${this.apiUrl}/api/MainMenus/hierarchical`);
    // ใช้ hierarchical API เป็นหลัก
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus/hierarchical`)
      .pipe(
        map(response => {
          console.log('📊 Hierarchical API Response:', response);
          if (!response.success || !response.data) {
            console.error('❌ Hierarchical API response invalid:', response);
            throw new Error(response.message || 'Failed to get hierarchical menu');
          }

          if (response.data.length === 0) {
            console.warn('⚠️ Hierarchical API returned empty data. This might be because:');
            console.warn('   - No active menus (IsActive = true)');
            console.warn('   - No root menus (Parent = null)');
            console.warn('   - Database is empty');
            console.warn('   - Trying flat API as fallback...');
            throw new Error('No hierarchical data available');
          }

          console.log('✅ Hierarchical API success! Converting data...');
          const converted = this.convertHierarchicalToMenuItem(response.data);
          console.log('✅ Hierarchical conversion successful:', converted);
          return converted;
        }),
        catchError(error => {
          console.error('❌ Hierarchical API failed, trying flat API as fallback:', error);
          return this.getFlatMenuAsBackup();
        })
      );
  }

  private convertHierarchicalToMenuItem(hierarchicalData: MainMenuDto[]): MenuItem[] {
    console.log('🌳 Converting hierarchical API data to MenuItem format:', hierarchicalData);
    const converted = hierarchicalData.map(menu => ({
      Id: menu.id,
      Parent: menu.parent || 0,
      Name: menu.name,
      Description: menu.description,
      IsActive: menu.isActive ? 1 : 0,
      Link: menu.link,
      Sequent: menu.sequent || 0,
      Image: menu.image,
      DoMain: menu.doMain || 'WMS-Main',
      Children: menu.childMenus ? this.convertHierarchicalToMenuItem(menu.childMenus) : undefined
    }));
    console.log('✅ Hierarchical conversion result:', converted);
    return converted;
  }

  private getFlatMenuAsBackup(): Observable<MenuItem[]> {
    console.log('🔧 Using flat API as backup');
    console.log('🌐 Backup calling:', `${this.apiUrl}/api/MainMenus`);
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus`)
      .pipe(
        map(response => {
          console.log('📊 Flat API Backup Response:', response);
          if (!response.success || !response.data || !Array.isArray(response.data)) {
            throw new Error(response.message || 'Invalid API response format');
          }

          if (response.data.length === 0) {
            throw new Error('No menu data available from API');
          }

          console.log('🔄 Converting flat data to MenuItem...');
          const converted = this.convertToMenuItem(response.data);
          console.log('📝 Converted items:', converted);

          console.log('🏗️ Building hierarchy...');
          const hierarchical = this.buildHierarchy(converted);
          console.log('✅ Flat backup conversion successful:', hierarchical);
          return hierarchical;
        }),
        catchError(error => {
          console.error('❌ Both APIs failed, using static JSON as final fallback:', error);
          console.log('🔄 Loading mainmenus.json as fallback...');
          // สุดท้าย fallback ไป JSON
          return this.http.get<MenuItem[]>('/data/mainmenus.json').pipe(
            map(jsonData => {
              console.log('✅ Successfully loaded mainmenus.json:', jsonData);
              console.log('🏗️ Building hierarchy from JSON data...');
              const hierarchical = this.buildHierarchy(jsonData);
              console.log('✅ JSON hierarchy built successfully:', hierarchical);
              return hierarchical;
            }),
            catchError(jsonError => {
              console.error('💥 All data sources failed:', jsonError);
              console.log('🚨 Returning empty array as final fallback');
              return of([]); // ถ้าทุกอย่างไม่ทำงาน ส่ง empty array
            })
          );
        })
      );
  }

  private getHierarchicalAsBackup(): Observable<MenuItem[]> {
    console.log('🔧 Using hierarchical API as backup');
    console.log('🌐 Backup calling:', `${this.apiUrl}/api/MainMenus/hierarchical`);
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus/hierarchical`)
      .pipe(
        map(response => {
          console.log('📊 Hierarchical Backup Response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to get hierarchical menu');
          }

          if (response.data.length === 0) {
            throw new Error('Hierarchical API also returned empty data');
          }

          // Convert hierarchical data ที่ได้จาก API มาเป็น MenuItem
          const converted = this.convertHierarchicalToMenuItem(response.data);
          console.log('✅ Hierarchical backup successful:', converted);
          return converted;
        }),
        catchError(error => {
          console.error('❌ Both APIs failed, using static JSON as final fallback:', error);
          // สุดท้าย fallback ไป JSON
          return this.http.get<MenuItem[]>('/data/mainmenus.json').pipe(
            catchError(jsonError => {
              console.error('💥 All data sources failed:', jsonError);
              return []; // ถ้าทุกอย่างไม่ทำงาน ส่ง empty array
            })
          );
        })
      );
  }

  // Management API Methods
  getAllMenus(): Observable<MainMenuDto[]> {
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getMenuById(id: number): Observable<MainMenuDto> {
    return this.http.get<ApiResponse<MainMenuDto>>(`${this.apiUrl}/api/MainMenus/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getHierarchicalMenus(): Observable<MainMenuDto[]> {
    console.log('🔧 Using flat API for management with hierarchy building');
    console.log('🌐 Calling:', `${this.apiUrl}/api/MainMenus`);
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus`)
      .pipe(
        map(response => {
          console.log('📊 Flat API Response for Management:', response);
          if (!response.success || !response.data || !Array.isArray(response.data)) {
            throw new Error(response.message || 'Invalid API response format');
          }

          if (response.data.length === 0) {
            console.warn('⚠️ No menu data available from flat API');
            return [];
          }

          console.log('🏗️ Building hierarchy from flat data...');
          const hierarchicalData = this.buildHierarchyForManagement(response.data);
          console.log('✅ Management hierarchy built successfully:', hierarchicalData);
          return hierarchicalData;
        }),
        catchError(this.handleError)
      );
  }

  getMenusByParent(parentId?: number): Observable<MainMenuDto[]> {
    const params = parentId ? `?parentId=${parentId}` : '';
    return this.http.get<ApiResponse<MainMenuDto[]>>(`${this.apiUrl}/api/MainMenus/by-parent${params}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createMenu(menu: CreateMainMenuDto): Observable<MainMenuDto> {
    return this.http.post<ApiResponse<MainMenuDto>>(`${this.apiUrl}/api/MainMenus`, menu)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateMenu(id: number, menu: UpdateMainMenuDto): Observable<MainMenuDto> {
    return this.http.put<ApiResponse<MainMenuDto>>(`${this.apiUrl}/api/MainMenus/${id}`, menu)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/api/MainMenus/${id}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  checkMenuExists(id: number): Observable<boolean> {
    return this.http.get<void>(`${this.apiUrl}/api/MainMenus/${id}/exists`)
      .pipe(
        map(() => true),
        catchError(error => {
          if (error.status === 404) {
            return [false];
          }
          return throwError(() => error);
        })
      );
  }

  private convertToMenuItem(menus: MainMenuDto[]): MenuItem[] {
    console.log('🔄 Converting API data to MenuItem format:', menus);
    const converted = menus.map(menu => ({
      Id: menu.id,
      Parent: menu.parent || 0,
      Name: menu.name,
      Description: menu.description,
      IsActive: menu.isActive ? 1 : 0,
      Link: menu.link,
      Sequent: menu.sequent || 0,
      Image: menu.image,
      DoMain: menu.doMain || 'WMS-Main',
      Children: menu.childMenus ? this.convertToMenuItem(menu.childMenus) : undefined
    }));
    console.log('✅ Conversion result:', converted);
    return converted;
  }

  private buildHierarchy(flatItems: MenuItem[]): MenuItem[] {
    console.log('🏗️ Building hierarchy from items:', flatItems);
    console.log('📊 Total items to process:', flatItems.length);

    // แสดงรายการทั้งหมดก่อน
    flatItems.forEach(item => {
      console.log(`📋 Item: ID=${item.Id}, Parent=${item.Parent}, Name="${item.Name}"`);
    });

    // Create a map for quick lookup
    const itemMap = new Map<number, MenuItem>();
    flatItems.forEach(item => {
      itemMap.set(item.Id, { ...item, Children: [] });
    });

    console.log('📋 Item map created with keys:', Array.from(itemMap.keys()));
    const rootItems: MenuItem[] = [];

    // Build the hierarchy
    flatItems.forEach(item => {
      const currentItem = itemMap.get(item.Id)!;

      console.log(`🔍 Processing item ${item.Id} (${item.Name}) with parent ${item.Parent}`);

      if (item.Parent === 0 || item.Parent === null || item.Parent === undefined) {
        // Root item
        console.log(`🌱 Adding root item: ${item.Name}`);
        rootItems.push(currentItem);
      } else {
        // Child item
        const parent = itemMap.get(item.Parent);
        if (parent) {
          if (!parent.Children) parent.Children = [];
          parent.Children.push(currentItem);
          console.log(`🔗 Added ${item.Name} as child of ${parent.Name} (${parent.Children.length} total children)`);
        } else {
          // If parent not found, treat as root
          console.log(`⚠️ Parent ${item.Parent} not found for ${item.Name}, treating as root`);
          rootItems.push(currentItem);
        }
      }
    });

    console.log('✅ Final hierarchy built:');
    rootItems.forEach(root => {
      console.log(`🌳 Root: ${root.Name} (ID: ${root.Id}) - Children: ${root.Children?.length || 0}`);
      if (root.Children && root.Children.length > 0) {
        root.Children.forEach(child => {
          console.log(`  └── Child: ${child.Name} (ID: ${child.Id})`);
        });
      }
    });

    return rootItems;
  }

  private buildHierarchyForManagement(flatItems: MainMenuDto[]): MainMenuDto[] {
    console.log('🏗️ Building hierarchy for management from items:', flatItems);
    console.log('📊 Total items to process:', flatItems.length);

    // แสดงรายการทั้งหมดก่อน
    flatItems.forEach(item => {
      console.log(`📋 Item: ID=${item.id}, Parent=${item.parent}, Name="${item.name}"`);
    });

    // Create a map for quick lookup
    const itemMap = new Map<number, MainMenuDto>();
    flatItems.forEach(item => {
      itemMap.set(item.id, { ...item, childMenus: [] });
    });

    console.log('📋 Item map created with keys:', Array.from(itemMap.keys()));
    const rootItems: MainMenuDto[] = [];

    // Build the hierarchy
    flatItems.forEach(item => {
      const currentItem = itemMap.get(item.id)!;

      console.log(`🔍 Processing item ${item.id} (${item.name}) with parent ${item.parent}`);

      if (item.parent === 0 || item.parent === null || item.parent === undefined) {
        // Root item
        console.log(`🌱 Adding root item: ${item.name}`);
        rootItems.push(currentItem);
      } else {
        // Child item
        const parent = itemMap.get(item.parent);
        if (parent) {
          if (!parent.childMenus) parent.childMenus = [];
          parent.childMenus.push(currentItem);
          console.log(`🔗 Added ${item.name} as child of ${parent.name} (${parent.childMenus.length} total children)`);
        } else {
          // If parent not found, treat as root
          console.log(`⚠️ Parent ${item.parent} not found for ${item.name}, treating as root`);
          rootItems.push(currentItem);
        }
      }
    });

    console.log('✅ Final management hierarchy built:');
    rootItems.forEach(root => {
      console.log(`🌳 Root: ${root.name} (ID: ${root.id}) - Children: ${root.childMenus?.length || 0}`);
      if (root.childMenus && root.childMenus.length > 0) {
        root.childMenus.forEach(child => {
          console.log(`  └── Child: ${child.name} (ID: ${child.id})`);
        });
      }
    });

    return rootItems;
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
