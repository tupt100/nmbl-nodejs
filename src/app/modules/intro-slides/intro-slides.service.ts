import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()

export class IntroService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch introduction for modal slides
   * @param modelType Modal Type (P/W/T/Docs)
   */
  displayIntro(modelType: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/introslide/?module=${modelType}`);
  }

  /**
   * Update into slides
   * @param modelType Modal Type (P/W/T/Docs)
   */
  updateIntro(modelType: string): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}api/introslide/?module=${modelType}`, {});
  }
}
