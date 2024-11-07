import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()
export class GroupService {

  constructor(private http: HttpClient) { }

  /**
   * Get permission groups listing
   * @param data Params data
   */
  group_list(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/group_list/`, { params: data });
  }

  /**
   * Fetch permission group details
   * @param id Group ID
   */
  group_list_by_id(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/group_list/${id}/`);
  }

  /**
   * Fetch groups listing
   * @param data Params data
   */
  work_group(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/`, { params: data });
  }

  /**
   * Fetch user workgroups
   * @param data Params data
   */
  listUserWorkGroups(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/user_workgroup/`, { params: data });
  }

  /**
   * Fetch worgroup users
   * @param id Workgroup ID
   */
  userwork_group_by_id(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/user_workgroup/${id}/`);
  }

  /**
   * Fetch workgroup details
   * @param id Workgroup ID
   */
  work_group_by_id(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${id}/`);
  }

  /**
   * Fetch company workgroups
   * @param data Params data
   */
  company_work_group(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_work_group/`, { params: data });
  }

  /**
   * Create new workgroup
   * @param data Payload
   */
  createGroup(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group_members/workgroup_create/`, data);
  }

  /**
   * Rename workgroup
   * @param groupId Workgroup ID
   * @param data Payload
   */
  upddateGroupName(groupId: number, data: any): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${groupId}/`, data);
  }

  /**
   * Update workgroup members
   * @param groupId Workgroup ID
   * @param data Payload
   */
  updateGroupMember(groupId: number, data: any): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${groupId}/workgroup_add_members/`, data);
  }

  /**
   * Remove user from workgroup
   * @param groupId Workgroup ID
   * @param data Payload
   */
  removeUserFromGroups(groupId: number, data: any): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${groupId}/workgroup_remove_members`, data);
  }

  /**
   * Fetch statistics details for workgroup
   * @param id Workgroup ID
   */
  getWorkgroupDetailStatistic(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/user_workgroup/${id}/workgroup_details_statistic/`);
  }

}
