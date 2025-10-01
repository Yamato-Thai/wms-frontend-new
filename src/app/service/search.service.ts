import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SearchFilters, SearchResult } from '../main/component-center/search-center/search-center.component';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  // Mock API call for searching
  searchData(filters: SearchFilters): Observable<SearchResult[]> {
    // Simulate API delay
    return of(this.getMockResults(filters)).pipe(delay(1000));
  }

  // Mock data generator based on filters
  private getMockResults(filters: SearchFilters): SearchResult[] {
    const mockData: SearchResult[] = [
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
      },
      {
        id: 'RCV-2024-003',
        poNumber: 'PO-2024-003',
        receiveNumber: 'RCV-2024-003',
        vendor: 'บริษัท ซี จำกัด',
        date: '2024-01-17',
        status: 'Received',
        type: 'Return',
        items: 5,
        totalValue: 12000
      },
      {
        id: 'RCV-2024-004',
        poNumber: 'PO-2024-004',
        receiveNumber: 'RCV-2024-004',
        vendor: 'บริษัท เอ จำกัด',
        date: '2024-01-18',
        status: 'Pending',
        type: 'Normal',
        items: 20,
        totalValue: 35000
      }
    ];

    // Filter based on search criteria
    return mockData.filter(item => {
      const matchesPO = !filters.poNumber || 
        item.poNumber?.toLowerCase().includes(filters.poNumber.toLowerCase());
      
      const matchesReceive = !filters.receiveNumber || 
        item.receiveNumber?.toLowerCase().includes(filters.receiveNumber.toLowerCase());
      
      const matchesStatus = !filters.status || item.status === filters.status;
      
      const matchesType = !filters.type || item.type === filters.type;
      
      const matchesVendor = !filters.vendor || 
        item.vendor.toLowerCase().includes(filters.vendor.toLowerCase());

      // Date filtering
      let matchesDateRange = true;
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && new Date(item.date) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && new Date(item.date) <= new Date(filters.dateTo);
      }

      return matchesPO && matchesReceive && matchesStatus && matchesType && matchesVendor && matchesDateRange;
    });
  }

  // For real API implementation, you would have methods like:
  /*
  searchPurchaseOrders(filters: SearchFilters): Observable<SearchResult[]> {
    return this.http.post<SearchResult[]>('/api/search/purchase-orders', filters);
  }

  searchReceiveDocuments(filters: SearchFilters): Observable<SearchResult[]> {
    return this.http.post<SearchResult[]>('/api/search/receive-documents', filters);
  }

  searchAllDocuments(filters: SearchFilters): Observable<SearchResult[]> {
    return this.http.post<SearchResult[]>('/api/search/all-documents', filters);
  }
  */
}
