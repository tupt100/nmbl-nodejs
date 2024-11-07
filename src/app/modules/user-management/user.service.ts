import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../config/web.config';

interface IPermisison {
  permission_slug: string;
  model_type: string;
}

@Injectable()
export class UserService {
  /**
   * Properties
   */
  private permissionArray = {};
  private mapPermission = {
    'project_associate-a-workflow': 'project_associate_a_workflow',
    'project_view-archived': 'project_view_archived',
    'project_mark-as-completed': 'project_mark_as_completed',
    'project_set-rank-drag-drop': 'project_set_rank_drag_drop',
    'project_change-due-date': 'project_set_due_date',
    'project_change-importance': 'project_set_importance',
    'project_add-team-members': 'project_add_team_members',
    'project_assign-owner': 'project_assign_owner',
    'project_upload-docs': 'project_upload_docs',
    'project_project-delete': 'project_project_delete',
    'project_project-update': 'project_project_update',
    'project_project-create': 'project_project_create',
    'project_project-view': 'project_project_view',
    'project_project-view-all': 'project_project_view_all',
    'project_delete-doc': 'project_delete_doc',
    'project_create-edit-privilege-selector': 'project_create_edit_privilege_selector',
    'project_project-edit-name': 'project_project_edit_name',
    'workflow_associate-to-project': 'workflow_associate_to_project',
    'workflow_view-archived': 'workflow_view_archived',
    'workflow_mark-as-completed': 'workflow_mark_as_completed',
    'workflow_set-rank-drag-drop': 'workflow_set_rank_drag_drop',
    'workflow_change-due-date': 'workflow_set_due_date',
    'workflow_change-importance': 'workflow_set_importance',
    'workflow_create-task': 'workflow_create_task',
    'workflow_add-team-members': 'workflow_add_team_members',
    'workflow_assign-owner': 'workflow_assign_owner',
    'workflow_workflow-delete': 'workflow_workflow_delete',
    'workflow_workflow-update': 'workflow_workflow_update',
    'workflow_workflow-create': 'workflow_workflow_create',
    'workflow_workflow-view': 'workflow_workflow_view',
    'workflow_workflow-view-all': 'workflow_workflow_view_all',
    'workflow_upload-docs': 'workflow_upload_docs',
    'workflow_delete-doc': 'workflow_delete_doc',
    'workflow_create-edit-privilege-selector': 'workflow_create_edit_privilege_selector',
    'workflow_workflow-edit-name': 'workflow_workflow_edit_name',
    'task_create-edit-privilege-selector': 'task_create_edit_privilege_selector',
    'task_task-edit-name': 'task_task_edit_name',
    'task_associate-to-workflow': 'task_associate_to_workflow',
    'task_reopen-task': 'task_reopen_task',
    'task_view-archived': 'task_view_archived',
    'task_reassign-task': 'task_reassign_task',
    'task_mark-as-completed': 'task_mark_as_completed',
    'task_status-update': 'task_status_update',
    'task_set-rank-drag-drop': 'task_set_rank_drag_drop',
    'task_change-due-date': 'task_set_due_date',
    'task_upload-docs': 'task_upload_docs',
    'task_change-importance': 'task_set_importance',
    'task_task-delete': 'task_task_delete',
    'task_task-update': 'task_task_update',
    'task_task-create': 'task_task_create',
    'task_task-view': 'task_task_view',
    'task_task-view-all': 'task_task_view_all',
    'task_send-ping': 'task_send_ping',
    'task_delete-doc': 'task_delete_doc',
    'request_request-view': 'request_request_view',
    'tasktemplate_tasktemplate-view': 'tasktemplate_tasktemplate_view',
    'tasktemplate_tasktemplate-view-all': 'tasktemplate_tasktemplate_view_all',
    'tasktemplate_tasktemplate-create': 'tasktemplate_tasktemplate_create',
    'tasktemplate_tasktemplate-destroy': 'tasktemplate_tasktemplate_destroy',
    'tasktemplate_tasktemplate-update': 'tasktemplate_tasktemplate_update',

  };
  private featureArray = {};
  constructor(private http: HttpClient) { }

  /**
   * Fetch logged user details
   */
  getLoggedInUserDetails(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/user/me/`);
  }

  /**
   * Fetch logged user permissions
   */
  getPermission(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/my-permission/?limit=100`, {});
  }

  /**
   * Remove user
   * @param userId User ID
   */
  removeUser(userId: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}api/company_user/${userId}/`);
  }

  /**
   * Update user details
   * @param userId User ID
   * @param data Payload
   */
  updateUser(userId: number, data: any) {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/company_user/${userId}`, data);
  }

  /**
   * Fetch user listings
   * @param data Params data
   */
  listUsers(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/user_list/`, { params: data });
  }

  /**
   * Fetch company users listings
   * @param data Params data
   */
  listCompanyUsers(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/company_user/`, { params: data });
  }

  /**
   * Fetch pending invites
   * @param data Params data
   */
  listPendingUsers(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/company-pending-invitation/`, { params: data });
  }

  /**
   * Fetch company user details
   * @param userId User ID
   */
  getCompanyUserDetails(userId: number) {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/company_user/${userId}/`);
  }

  /**
   * Remove pending user
   * @param userId User ID
   */
  removePendingUser(userId: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}api/company-pending-invitation/${userId}/`);
  }

  /**
   * Resend invite link to user
   * @param userId User ID
   */
  reSend(userId: number): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}api/resend-pending-invite/${userId}`, {});
  }

  /**
   * Send bulk inivitations
   * @param data Bulk invite payload
   */
  sendBulkInvite(data) {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}api/send_bulk_invitation/send_bulk_invitation/`, { data });
  }

  /**
   * Fetch workgroup details
   * @param workGroupId Workgroup ID
   */
  getWorkGroupDetailsById(workGroupId: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${workGroupId}/`);
  }

  /**
   * Remove workgroup
   * @param workGroupId Workgroup ID
   */
  removeUserWorkGroup(workGroupId: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}projects/api/work_group/${workGroupId}/`);
  }

  /**
   * Fetch user notification settings for modules
   * @param userId User ID
   * @param modelType Modal type
   */
  listCompanyUserNotifications(userId: number, modelType: string): Observable<any> {
    const url = `${API_BASE_URL}notifications/api/company_user_notification_settings/?user_id=${userId}&model_type=${modelType}`;
    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Update user notification settings for modules
   * @param userId User ID
   * @param data Payload
   */
  updateCompanyUsersNotificationSettings(userId: number, data: any): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/company_user_notification/${userId}/`, data);
  }

  /**
 * Get features status
 * @param data Message data
 */
  userFeatures(): Observable<any> {
    this.featureArray = { EXTERNAL_DOCS: false, TASKTEMPLATE: false };
    return this.http
      .get<IBaseResponse<any>>(`${API_BASE_URL}api/my-features`)
      .pipe(
        map((data: any) => {
          if (data && data.results) {
            const features: Array<any> = data.results;
            features.map((feature) => {
              this.featureArray[feature.key] = feature.value;
            });
          }
          data.features = this.featureArray;
          return data;
        })
      );
  }

  /**
   * Return user permissions by mapping slugs
   */
  userPermission(): Observable<any> {
    this.permissionArray = {
      project_associate_a_workflow: false,
      project_view_archived: false,
      project_mark_as_completed: false,
      project_set_rank_drag_drop: false,
      project_set_due_date: false,
      project_set_importance: false,
      project_add_team_members: false,
      project_assign_owner: false,
      project_upload_docs: false,
      project_project_delete: false,
      project_project_update: false,
      project_project_create: false,
      project_project_view: false,
      project_project_view_all: false,
      project_delete_doc: false,
      project_create_edit_privilege_selector: false,
      project_project_edit_name: false,
      workflow_associate_to_project: false,
      workflow_view_archived: false,
      workflow_mark_as_completed: false,
      workflow_set_rank_drag_drop: false,
      workflow_set_due_date: false,
      workflow_set_importance: false,
      workflow_create_task: false,
      workflow_add_team_members: false,
      workflow_assign_owner: false,
      workflow_workflow_delete: false,
      workflow_workflow_update: false,
      workflow_workflow_create: false,
      workflow_workflow_view: false,
      workflow_workflow_view_all: false,
      workflow_upload_docs: false,
      workflow_delete_doc: false,
      workflow_create_edit_privilege_selector: false,
      workflow_workflow_edit_name: false,
      task_associate_to_workflow: false,
      task_reopen_task: false,
      task_view_archived: false,
      task_reassign_task: false,
      task_mark_as_completed: false,
      task_status_update: false,
      task_set_rank_drag_drop: false,
      task_set_due_date: false,
      task_upload_docs: false,
      task_set_importance: false,
      task_task_delete: false,
      task_task_update: false,
      task_task_create: false,
      task_task_view: false,
      task_send_ping: false,
      task_task_view_all: false,
      task_delete_doc: false,
      task_create_edit_privilege_selector: false,
      task_task_edit_name: false,
      request_request_view: false,
      tasktemplate_tasktemplate_view: false,
      tasktemplate_tasktemplate_create: false,
      tasktemplate_tasktemplate_destroy: false,
      tasktemplate_tasktemplate_update: false,
    };
    return this.http
      .get<IBaseResponse<any>>(`${API_BASE_URL}api/my-permission/?limit=1000`)
      .pipe(
        map((data: any) => {
          if (data && data.results) {
            const perArray: Array<IPermisison> = data.results;
            perArray.map((obj) => {
              this.permissionArray[this.mapPermission[obj.permission_slug]] = true;
            });
          }
          data.permission = this.permissionArray;
          return data;
        })
      );
  }
}