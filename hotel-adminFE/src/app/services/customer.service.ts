import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Customer, CustomerListResponse } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  getCustomers(params: {
    search?: string;

    sortBy?: 'recentlyCreated' | 'oldestCreated' | 'nameAsc' | 'nameDesc';
    page?: number;
    limit?: number;
  }): Observable<CustomerListResponse> {
    const query = new URLSearchParams();

    if (params.search) {
      query.set('search', params.search);
    }

    if (params.sortBy) {
      query.set('sortBy', params.sortBy);
    }

    query.set('page', String(params.page || 1));
    query.set('limit', String(params.limit || 10));

    return this.http.get<CustomerListResponse>(`${this.apiUrl}?${query.toString()}`, { transferCache: false });
  }

  lookupByPhone(phone: string): Observable<Customer | null> {
    return this.http.get<Customer | null>(`${this.apiUrl}/lookup?phone=${encodeURIComponent(phone)}`, { transferCache: false });
  }

  exportCustomers(params: {
    search?: string;

    sortBy?: 'recentlyCreated' | 'oldestCreated' | 'nameAsc' | 'nameDesc';
  }): Observable<Blob> {
    const query = new URLSearchParams();

    if (params.search) {
      query.set('search', params.search);
    }

    if (params.sortBy) {
      query.set('sortBy', params.sortBy);
    }

    return this.http.get(`${this.apiUrl}/export?${query.toString()}`, {
      responseType: 'blob',
      transferCache: false,
    });
  }
}
