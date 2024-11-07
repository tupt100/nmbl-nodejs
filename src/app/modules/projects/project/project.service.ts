import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../../config/web.config';
import { CustomWorkflowTemplateOutputModel } from '../../custom-template-project/custom-template-model';

@Injectable()

export class ProjectService {

  constructor(private http: HttpClient) { }

  /**
   * Fetch projects
   * @param data request params for searching projects
   */
  listProjects(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/`, { params: data });
  }

  /**
   * Fetch project statistics data
   */
  getProjectStatistics(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects_statistic/`);
  }

  /**
   * Update project details
   * @param id Project ID
   * @param data Project payload
   */
  updateProject(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/${id}/`, data);
  }

  /**
   * Create Project
   * @param data Project payload
   */
  createProject(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/`, data);
  }

  /**
   * Get project details
   * @param id Project ID
   */
  getProject(id): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/${id}/`);
  }

  /**
   * Rename project title
   * @param id Project ID
   * @param body Project payload to rename project title
   */
  renameProjectTitle(id, body): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/${id}/rename_title/`, body);
  }

  /**
   * Set project Rank
   * @param id Project ID
   * @param body Project payload to set project rank
   */
  project_rank(id, body): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projectrankchange/${id}/`, body);
  }

  /**
   * Fetch project template
   * @param projectTemplateId Project Template ID
   */
  getProjectTemplate(projectTemplateId: string): Observable<CustomWorkflowTemplateOutputModel> {
    return this.http.get<CustomWorkflowTemplateOutputModel>(`${API_BASE_URL}projects/api/project-templates/${projectTemplateId}/`);
  }


  /**
   * Fetch project templates
   * @param data request params for project templates
   */
  getProjectTemplates(data?): Observable<CustomWorkflowTemplateOutputModel> {
    return this.http.get<CustomWorkflowTemplateOutputModel>(`${API_BASE_URL}projects/api/project-templates/`, { params: data });
  }
}
