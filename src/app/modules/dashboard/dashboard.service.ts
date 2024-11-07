import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';
import * as moment from 'moment';

@Injectable()

export class DashboardService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch assigned task listing
   * @param data Params data
   */
  getAssignedTask(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/dashboard_statistic/assigned_task/`, { params: data });
  }

  /**
   * Fetch upcoming P/W/T data
   * @param data Params data
   */
  getUpcomingWeek(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/dashboard_statistic/upcoming_week/?offset_time=${moment().utcOffset()}`);
  }
}
