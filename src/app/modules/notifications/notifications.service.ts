import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Message } from './notifications.interface';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL, API_SOCKET_URL } from '../../config/web.config';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  /**
   * Properties
   */
  public messages: Subject<Message>;

  constructor(
    private http: HttpClient,
    wsService: WebsocketService
  ) {
    /**
     * Connect to socket for fetching realtime notification messages
     */
    this.messages = wsService.connect(API_SOCKET_URL).map(
      (response: MessageEvent): Message => {
        const data = JSON.parse(response.data);
        return {
          username: data.username, msg_type: data.msg_type, message: data.message, unread_count: data.unread_count,
        };
      }
    ) as Subject<Message>;
  }

  /**
   * Get notification data
   * @param data Params data
   */
  listNotifications(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/notification/`, { params: data });
  }

  /**
   * Update notification status
   * @param id Notification ID
   * @param data Payload for read/unread notification
   */
  readNotification(id: number, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/notification/${id}/`, data);
  }

  /**
   * Update all notification with read status
   * @param data Params data
   */
  readAllNotifications(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/notification/read_all_notifications/`, { params: data });
  }

  /**
   * Delete notification
   * @param id Notification ID
   */
  deleteNotifications(id: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/notification/${id}/`);
  }
}
