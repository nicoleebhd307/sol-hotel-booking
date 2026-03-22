import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ReportsResponse } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/admin/reports`;

  constructor(private http: HttpClient) {}

  getReports(month: number, year: number): Observable<ReportsResponse> {
    const params = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));

    return this.http.get<ReportsResponse>(this.apiUrl, { params });
  }
}
