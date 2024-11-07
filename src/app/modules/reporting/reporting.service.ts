import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()
export class ReportingService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch productivity report data for CSV export
   * @param category Category
   * @param team Team
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  productivity_file_generate(
    category: string,
    team: string,
    group: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (category && category.length) {
      queryString = `?category=${category}`;
    }
    if (team && team.length) {
      queryString = `${queryString}&users=${team}`;
    }
    if (group && group.length) {
      queryString = `${queryString}&groups=${group}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&created_on_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&created_on_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/productivity_report/productivity_file_generate/${queryString}`);
  }

  /**
   * Fetch productivity report data
   * @param category Category
   * @param team Team
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateProductivityReport(
    category: string,
    team: string,
    group: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (category && category.length) {
      queryString = `?category=${category}`;
    }
    if (team && team.length) {
      queryString = `${queryString}&users=${team}`;
    }
    if (group && group.length) {
      queryString = `${queryString}&groups=${group}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&created_on_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&created_on_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/productivity_report/${queryString}`);
  }

  /**
   * Fetch productivity report data for line chart
   * @param category Category
   * @param team Team
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateProductivityGraph(
    category: string,
    team: string,
    group: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (category && category.length) {
      queryString = `?category=${category}`;
    }
    if (team && team.length) {
      queryString = `${queryString}&users=${team}`;
    }
    if (group && group.length) {
      queryString = `${queryString}&groups=${group}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&created_on_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&created_on_before=${dateTo}`;
    }
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/productivity_report/productivity_graph_generate/${queryString}`);
  }

  /**
   * Fetch efficiency report data for CSV export
   * @param user User
   * @param dateFrom Start date
   * @param dateTo End date
   */
  efficiency_file_generate(
    user: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (user && user.length) {
      queryString = `?users=${user}`;
    }
    if (dateFrom && dateFrom.length) {
      if (queryString.length === 0) {
        queryString = `${queryString}?from_date=${dateFrom}`;
      } else {
        queryString = `${queryString}&from_date=${dateFrom}`;
      }
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&to_date=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/efficiency_report/efficiency_file_generate/${queryString}`);
  }

  /**
   * Fetch efficiency report data
   * @param user User
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateEfficiencyReport(
    user: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (user && user.length) {
      queryString = `?users=${user}`;
    }
    if (dateFrom && dateFrom.length) {
      if (queryString.length === 0) {
        queryString = `${queryString}?from_date=${dateFrom}`;
      } else {
        queryString = `${queryString}&from_date=${dateFrom}`;
      }
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&to_date=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/efficiency_report/${queryString}`);
  }

  /**
   * Fetch workload report data for CSV export
   * @param user User
   * @param dateFrom Start date
   * @param dateTo End date
   */
  team_member_workload_file_generate(
    user: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (user && user.length) {
      queryString = `?users=${user}`;
    }
    if (dateFrom && dateFrom.length) {
      if (queryString.length === 0) {
        queryString = `${queryString}?changed_at_after=${dateFrom}`;
      } else {
        queryString = `${queryString}&changed_at_after=${dateFrom}`;
      }
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }
    const url = `${API_BASE_URL}projects/api/team_member_workload_report/team_member_workload_file_generate/${queryString}`;

    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Fetch workload report data
   * @param user User
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateWorkloadReport(
    user: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (user && user.length) {
      queryString = `?users=${user}`;
    }
    if (dateFrom && dateFrom.length) {
      if (queryString.length === 0) {
        queryString = `${queryString}?changed_at_after=${dateFrom}`;
      } else {
        queryString = `${queryString}&changed_at_after=${dateFrom}`;
      }
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/team_member_workload_report/${queryString}`);
  }

  /**
   * Fetch group workload report data for CSV export
   * @param category Category
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  group_workload_file_generate(
    category: string,
    group: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (category && category.length) {
      queryString = `?category=${category}`;
    }
    if (group && group.length) {
      queryString = `${queryString}&groups=${group}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&changed_at_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }
    const url = `${API_BASE_URL}projects/api/group_workload_report/group_workload_file_generate/${queryString}`;

    return this.http.get<IBaseResponse<any>>(url);
  }

  /**
   * Fetch group workload report data
   * @param category Category
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateGroupWorkloadReport(
    category: string,
    group: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (category && category.length) {
      queryString = `?category=${category}`;
    }
    if (group && group.length) {
      queryString = `${queryString}&groups=${group}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&changed_at_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/group_workload_report/${queryString}`);
  }

  /**
   * Fetch privilege log report data
   * @param privilege Privilige
   * @param category Category
   * @param group Group
   * @param dateFrom Start date
   * @param dateTo End date
   */
  getPrivilegeLogReport(
    privilege: string,
    category: string,
    user: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (privilege && privilege.length) {
      queryString = `?privilege=${privilege}`;
    }
    if (category && category.length) {
      queryString = `${queryString}&category=${category}`;
    }
    if (user && user.length) {
      queryString = `${queryString}&user=${user}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&changed_at_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/privilage_report/${queryString}`);
  }

  /**
   * Fetch tags report data for CSV export
   * @param tags Tags
   * @param category Category
   * @param dateFrom Start date
   * @param dateTo End date
   */
  tag_report_file_generate(
    tags: string,
    category: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (tags && tags.length) {
      queryString = `?tags=${tags}`;
    }
    if (category && category.length) {
      queryString = `${queryString}&category=${category}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&changed_at_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tag_report/tag_report_file_generate/${queryString}`);
  }

  /**
   * Fetch tags report data
   * @param tags Tags
   * @param category Category
   * @param dateFrom Start date
   * @param dateTo End date
   */
  generateTagsReportReport(
    tags: string,
    category: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    let queryString = '';
    if (tags && tags.length) {
      queryString = `?tags=${tags}`;
    }
    if (category && category.length) {
      queryString = `${queryString}&category=${category}`;
    }
    if (dateFrom && dateFrom.length) {
      queryString = `${queryString}&changed_at_after=${dateFrom}`;
    }
    if (dateTo && dateTo.length) {
      queryString = `${queryString}&changed_at_before=${dateTo}`;
    }

    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tag_report/${queryString}`);
  }

}
