import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../config/web.config';
import { IBaseResponse } from 'src/app/apiBaseModel/baseResponse';

@Injectable()
export class CommonService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Fetch audit trail history
   * @param modalType Modal Type P/W/T
   * @param id Modal ID
   */
  listAuditTrail(modalType: string, id: string): Observable<any> {
    const url = `${API_BASE_URL}projects/api/audit_history/?model_type=${modalType}&model_id=${id}&offset_time=${moment().utcOffset()}`;
    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Fetch messages for P/W/T
   * @param data URL params
   */
  getMessages(data: any): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/servicedeskrequest_message/`, { params: data });
  }

  /**
   * Fetch messages for submitted requests
   * @param params URL params
   */
  getSubmitRequestMessages(params) {
    const url = `${API_BASE_URL}projects/api/submitted_request_portal/submitrequest_messages/`;
    return this.http.get<IBaseResponse<any>>(url, { params });
  }

  /**
   * Delete message
   * @param id Modal ID
   * @param type Modal type
   * @param body Message ID
   */
  deleteMessage(id, type, body): Observable<any> {
    const url = `${API_BASE_URL}projects/api/${type}s/${id}/${type}_delete_messages/`;
    return this.http.post<IBaseResponse<any>>(url, body);
  }

  /**
   * New contact request
   * @param id Modal ID
   * @param type Modal type
   * @param body New contact request body
   */
  requestAssociateUser(id, type, body): Observable<any> {
    const url = `${API_BASE_URL}projects/api/${type}s/${id}/request_associate_to_${type}/`;
    return this.http.patch<IBaseResponse<any>>(url, body);
  }

  /**
   * Send Message for P/W/T
   * @param type Modal type
   * @param data Message data
   */
  sendMessage(type: string, data: any): Observable<any> {
    const url = `${API_BASE_URL}projects/api/${type}s/${type}_add_messages/`;
    return this.http.post<IBaseResponse<any>>(url, data);
  }

  /**
   * Send submitted requests message
   * @param data Message data
   */
  sendSubmitRequestsMsg(data: any): Observable<any> {
    const url = `${API_BASE_URL}projects/api/submitted_request_portal/submitrequest_add_messages/`;
    return this.http.post<IBaseResponse<any>>(url, data);
  }
}
