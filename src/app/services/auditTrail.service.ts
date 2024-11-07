import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { IBaseResponse } from '../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../config/web.config';

@Injectable()
export class AuditTrailService {

  constructor(private http: HttpClient) { }

  /**
   * List audit trail history
   */
  listAuditTrail = (data) => {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/audit_history/`, { params: data });
  }

  /**
   * Create audit trail
   * @param data Audit trail payload
   */
  createAuditTrail(data): Observable<IBaseResponse<any>> {
    return this.http.post(`${API_BASE_URL}projects/api/audit_history/`, data);
  }
}

