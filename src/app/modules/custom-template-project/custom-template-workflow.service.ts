import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';
import { CustomField, CustomFieldOutputModel, CustomWorkflowTemplateOutputModel } from './custom-template-model';

@Injectable()

export class CustomTemplateWorkflowService {
  static changeStep = new EventEmitter<{ step: string, prevStep?: string }>();
  static customTemplateTaskId: number;
  static prevStep = '';



  constructor(
    private http: HttpClient
  ) {
    CustomTemplateWorkflowService.changeStep.subscribe(data => {
      CustomTemplateWorkflowService.prevStep = data.prevStep;
    });
  }

  changeWizardStep(step, prevStep) {
    CustomTemplateWorkflowService.changeStep.emit({ step: step, prevStep: prevStep });
  }

  /**
   * CreateWworkflowTemplate
   * posting workflow name
   * @param data Params data
   */
  createWorkflowTemplate(data?): Observable<any> {
    const template = new CustomWorkflowTemplateOutputModel(data);
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates/`, template);
  }

  /**
   * RemoveTaskTemplate
   * removing task template
   * @param id Params data
   */
  removeWorkflowTemplate(id?): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/project-templates/${id}`)
  }

  /**
   * UpdateTaskTemplate
   * posting workflow name
   * @param data Params data
   * @param id Params id
   */
  updateWorkflowTemplate(data, id): Observable<any> {
    const template = new CustomWorkflowTemplateOutputModel(data);
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates/${id}/`, template);
  }

  /**
   * CreateCustomField
   * creating template custom field
   * @param data Params data
   */
  createCustomField(data): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates-custom-fields/`, field);
  }

  /**
   * UpdateWworkflowTemplateField
   * updating workflow template
   * @param data Params data
   * @param id Params id
   */
  updateCustomField(data, id): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates-custom-fields/${id}/`, field);
  }

  /**
   * GetWorkflowTemplateFields
   * @param id Params id
   */
  getWorkflowTemplateCustomFields(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates-custom-fields?project_template_id=${id}`);
  }


  /**
   * GetWorkflowTemplateFields
   * updating task template
   * @param id Params id
   */
  getCustomWorkflowTemplates(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates/`, { params: data });
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
  getCustomWorkflowTemplateDetails(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/project-templates/${id}/`);
  }

  /**
   * removeCustomField
   * updating task template
   * @param id Params id
   */
  removeCustomField(data: CustomField, taskTemplateId): Observable<any> {
    const field = new CustomFieldOutputModel(data);
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/project-templates-custom-fields/${field.pk}/`)
  }

  /**
   * Create Task
   * @param data Task payload
   */
  createTask(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflow-fixtures/`, data);
  }

  getTask(id): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflow-fixtures/${id}`);
  }

  removeTask(id): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(
      `${API_BASE_URL}projects/api/workflow-fixtures/${id}/`)
  }

  updateTask(data, id): Observable<any> {
    return this.http.put<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflow-fixtures/${id}/`, data);
  }

}
