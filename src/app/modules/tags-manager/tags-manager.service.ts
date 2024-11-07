import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from 'src/app/config/web.config';

@Injectable()
export class TagsService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch all tags
   * @param data Params data
   */
  listTags(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/`, { params: data });
  }

  /**
   * Create new tag
   * @param data Tag payload
   */
  createTag(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/`, data);
  }

  /**
   * Update tag
   * @param id Tag ID
   * @param data Tag payload
   */
  updateTag(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/${id}/`, data);
  }

  /**
   * Delete tag
   * @param id Tag ID
   */
  deleteTag(id): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/${id}/`);
  }

  /**
   * Fetch tag details
   * @param id Tag ID
   */
  getTagDetail(id): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/${id}/`);
  }
}
