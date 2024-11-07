import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';
import { CustomField, CustomFieldOutputModel } from './custom-field-model';

@Injectable()

export class GlobalCustomFieldService {
  static changeStep = new EventEmitter<{ step: string, prevStep?: string }>();
  static customTemplateTaskId: number;
  static prevStep = '';



  constructor(
    private http: HttpClient
  ) {
    GlobalCustomFieldService.changeStep.subscribe(data => {
      GlobalCustomFieldService.prevStep = data.prevStep;
    });
  }

  changeWizardStep(step, prevStep) {
    GlobalCustomFieldService.changeStep.emit({ step: step, prevStep: prevStep });
  }

  /**
   * CreateCustomField
   * creating template custom field
   * @param data Params data
   */
  createCustomField(data): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-fields/`, field);
  }

  /**
   * UpdateTaskTemplateField
   * updating task template
   * @param data Params data
   * @param id Params id
   */
  updateCustomField(data, id): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-fields/${id}/`, field);
  }


  /**
   * GetTaskTemplateFields
   * updating task template
   * @param id Params id
   */
  getGlabalCustomFields(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-fields/`, { params: data });
  }


  /**
   * GetTaskTemplateFields
   * updating task template
   * @param url Params url
   */
  getCustomTaskTemplatesPage(url): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${url}`);
  }

  /**
   * GetTaskTemplateFields
   * updating task template
   * @param id Params id
   */
  getCustomFieldDetails(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-fields/${id}/`);
  }

  /**
   * CreateTaskTemplate
   * updating task template
   * @param id Params id
   */
  removeCustomField(fieldId): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/global-custom-fields/${fieldId}/`)
  }

  /**
   * CreateCustomFieldValues
   * creating custom field values
   * @param data Params data
   */
  createCustomFieldValues(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-field-values/`, data);
  }

  /**
   * UpdateCustomFieldValues
   * updating custom field values
   * @param data Params data
   */
  updateCustomFieldValues(data): Observable<any> {
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-field-values/multiple_update/`, data);
  }

  /**
   * GetCustomFieldValues
   * getting custom field values
   * @param content_type Params data
   */
  getCustomFieldValues(content_type): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/global-custom-field-values/?content_type=${content_type}`);
  }

}
