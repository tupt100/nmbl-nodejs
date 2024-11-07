import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../../config/web.config';
import { CustomWorkflowTemplateOutputModel } from '../../custom-template-workflow/custom-template-model';

@Injectable()

export class WorkflowService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch workflows
   * @param data Params data
   */
  listWorkflow(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/`, { params: data });
  }

  /**
   * Fetch workflow details
   * @param id Workflow ID
   */
  getWorkflowById(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/${id}/`);
  }

  /**
   * Fetch workflows statistics data
   */
  getWorkflowStatistics(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows_statistic/`);
  }

  /**
   * Fetch workflow statistics for specific workflow
   * @param id Workflow ID
   */
  getWorkflowStatisticsById(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/${id}/workflow_details_statistic/`);
  }

  /**
   * Fetch tasks for specified workflow
   * @param data Params data with specified workflow
   */
  listWorkflowTasks(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/`, { params: data });
  }

  /**
   * Update workflow details
   * @param id Workflow ID
   * @param data Workflow payload
   */
  updateWorkflow(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/${id}/`, data);
  }

  /**
   * Create new workflow
   * @param data Workflow payload
   */
  createWorkflow(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/`, data);
  }

  /**
   * Rename workflow API
   * @param id Workflow ID
   * @param body Payload for rename workflow
   */
  reNameWorkflowTitle(id, body): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/${id}/rename_title/`, body);
  }

  /**
   * Fetch project informaton for workflow
   * @param id Workflow ID
   */
  workflowProjecStats(id): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/${id}/workflow_project_statistic/`);
  }

  /**
   * Fetch workflow template
   * @param workflowTemplateId Workflow Template ID
   */
  getWorkflowTemplate(workflowTemplateId: string): Observable<CustomWorkflowTemplateOutputModel> {
    return this.http.get<CustomWorkflowTemplateOutputModel>(`${API_BASE_URL}projects/api/workflow-templates/${workflowTemplateId}/`);
  }


  /**
   * Fetch workflow templates
   * @param data request params for workflow templates
   */
  getWorkflowTemplates(data?): Observable<CustomWorkflowTemplateOutputModel> {
    return this.http.get<CustomWorkflowTemplateOutputModel>(`${API_BASE_URL}projects/api/workflow-templates/`, { params: data });
  }

}
