import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()

export class AccountSettingsService {

  constructor(private http: HttpClient) { }

  /**
   * Change password API for logged in user
   * @param data Change password data
   */
  changePassword(data) {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/user/change_password/`, data);
  }

  /**
   * Update user info
   * @param id User ID
   * @param data Data to upldate user details
   */
  updateUser(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/user/${id}/`, data);
  }

  /**
   * Fetch user notification settings for different modal type
   * @param modelType Modal type
   */
  getUsersNotifications(modelType: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/user_notification_settings/?model_type=${modelType}`);
  }

  /**
   * Update user notification settings for different modal type
   * @param data Notification settings data
   */
  updateUsersNotifications(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/user_notification/`, data);
  }

  /**
   * Remove user avator
   */
  removeUserAvatar(): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}api/user/upload_avatar/`);
  }

  /**
   * Upload user avator image
   * @param data Upload user avator
   */
  uploadUserAvatar(data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/user/upload_avatar/`, data);
  }
}
