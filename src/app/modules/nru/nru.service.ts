import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()

export class NRUService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch company information
   */
  getCompanyInfo(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/company_information/`);
  }

  /**
   * Verify token
   * @param token Token
   */
  verifyToken(token: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/servicedesk-varification/${token}`);
  }

  /**
   * Fetch submitted requests
   * @param token Token
   */
  listRequestSubmitted(token: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/pending_request_desk/?auth=${token}`);
  }

  /**
   * Fetch current requests
   * @param token Token
   */
  listRequestCurrent(token: string): Observable<any> {
    const url = `${API_BASE_URL}projects/api/submitted_request_portal/?auth=${token}&status=active`;
    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Fetch request details
   * @param id Request ID
   * @param token Token
   */
  getCurrentRequestById(id: number, token: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/submitted_request_portal/${id}?auth=${token}`);
  }

  /**
   * Fetch completed requests
   * @param token Token
   */
  listRequestCompleted(token: string): Observable<any> {
    const url = `${API_BASE_URL}projects/api/submitted_request_portal/?auth=${token}&status=archived`;
    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Get token for step two after user enter name, email and phone number
   * @param data Payload
   */
  getTokenForStep2(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/user_information/`, data);
  }

  /**
   * Upload documents for request data
   * @param formData Formdata
   */
  uploadDocument(formData): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/doc_request_portal/`, formData);
  }

  /**
   * Submit new request
   * @param data Request payload
   */
  submitRequest(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/submit_new_request_portal/`, data);
  }

  /**
   * Send pending requests link to email
   * @param email Email
   */
  accessForPendingRequest(email: string): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/resend-requestpage-link/${email}/`, {});
  }

  /**
   * Upload documents for submitted requests
   * @param id Request ID
   * @param data Documents data
   */
  uploadSubmitRequestDocs(id, data): Observable<any> {
    const url = `${API_BASE_URL}projects/api/submitted_request_portal/${id}/add_document_to_request/`;
    return this.http.patch<IBaseResponse<any>>(url, data);
  }
}
