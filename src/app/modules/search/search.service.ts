import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from 'src/app/config/web.config';

@Injectable()
export class SearchService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Global Search API
   * @param data Search params
   */
  globalSearch(data: any): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global_search/`,  { params: data });
  }

}
