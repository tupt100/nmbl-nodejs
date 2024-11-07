import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';
import { CustomField, CustomFieldOutputModel, CustomTaskTemplateOutputModel } from './custom-template-model';

@Injectable()

export class CustomTemplateTaskService {
  static changeStep = new EventEmitter<{ step: string, prevStep?: string }>();
  static customTemplateTaskId: number;
  static prevStep = '';



  constructor(
    private http: HttpClient
  ) {
    CustomTemplateTaskService.changeStep.subscribe(data => {
      CustomTemplateTaskService.prevStep = data.prevStep;
    });
  }

  changeWizardStep(step, prevStep) {
    CustomTemplateTaskService.changeStep.emit({ step: step, prevStep: prevStep });
  }

  /**
   * CreateTaskTemplate
   * posting task name
   * @param data Params data
   */
  createTaskTemplate(data?): Observable<any> {
    const template = new CustomTaskTemplateOutputModel(data);
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates/`, template);
  }

  /**
   * RemoveTaskTemplate
   * removing task template
   * @param id Params data
   */
  removeTaskTemplate(id?): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/task-templates/${id}`)
  }

  /**
   * CreateTaskTemplate
   * posting task name
   * @param data Params data
   * @param id Params id
   */
  updateTaskTemplate(data, id): Observable<any> {
    const template = new CustomTaskTemplateOutputModel(data);
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates/${id}/`, template);
  }

  /**
   * CreateCustomField
   * creating template custom field
   * @param data Params data
   */
  createCustomField(data): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates-custom-fields/`, field);
  }

  /**
   * UpdateTaskTemplateField
   * updating task template
   * @param data Params data
   * @param id Params id
   */
  updateCustomField(data, id): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates-custom-fields/${id}/`, field);
  }

  /**
   * GetTaskTemplateFields
   * updating task template
   * @param id Params id
   */
  getTaskTemplateCustomFields(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates-custom-fields?task_template_id=${id}`);
  }


  /**
   * GetTaskTemplateFields
   * updating task template
   * @param id Params id
   */
  getCustomTaskTemplates(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates/`, { params: data });
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
  getCustomTaskTemplateDetails(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task-templates/${id}/`);
  }

  /**
   * CreateTaskTemplate
   * updating task template
   * @param id Params id
   */
  removeCustomField(data: CustomField, taskTemplateId): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/task-templates-custom-fields/${field.pk}/`)
  }

}
