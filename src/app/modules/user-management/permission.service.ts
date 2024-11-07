import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()
export class PermissionService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch all permissions
   * @param data Params Data
   */
  listPermission(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/permission_manager/`, { params: data });
  }

  /**
   * Fetch permission details
   * @param id Permission ID
   */
  getPermissionById(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/permission_manager/${id}/`);
  }

  /**
   * Fetch permission types
   */
  listPermissionTypes(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/permission-types/`);
  }

  /**
   * Create new permission
   * @param data Permission payload
   */
  createNewPermission(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}api/custom-group/`, data);
  }

  /**
   * Update permission
   * @param id Permission ID
   * @param data Permission payload
   */
  updatePermission(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/permission_manager/${id}/`, data);
  }

  /**
   * Update permission group name
   * @param id Permission ID
   * @param data Permission group payload
   */
  updatePermissionGroup(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/permission_manager/${id}/group_rename/`, data);
  }

  /**
   * Remove group from permission
   * @param id Permission ID
   * @param data Payload
   */
  removePermissionWithUser(id: number, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/permission_manager/${id}/group_delete/`, data);
  }
}
