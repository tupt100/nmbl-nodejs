import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()

export class RequestsService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch requests
   * @param data Params data
   */
  listRequests(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_service_desk_portal/`, { params: data });
  }

  /**
   * Fetch request detail
   * @param id Request ID
   */
  getRequestDetailsById(id): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_service_desk_portal/${id}/`);
  }

  /**
   * Delete request
   * @param id Request ID
   */
  removeRequest(id: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_service_desk_portal/${id}/`);
  }

  /**
   * Convert request into task
   * @param data Request payload
   */
  bulkTaskCreate(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_service_desk_portal/bulk_task_creation/`, data);
  }
}
