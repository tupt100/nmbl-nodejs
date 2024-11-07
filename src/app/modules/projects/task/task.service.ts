import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../../config/web.config';
import { CustomTaskTemplateOutputModel } from '../../custom-template-task/custom-template-model';

@Injectable()
export class TaskService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Fetch task detail
   * @param taskId Task ID
   */
  getTask(taskId: string): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/${taskId}/`);
  }

  /**
   * Fetch tasks
   * @param data request params for tasks
   */
  getTasks(data?): Observable<any> {
    if (data && data.project) {
      data.project = data.project.id;
    }
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/`, { params: data });
  }

  /**
   * Fetch workgroups
   * @param data request params for workgroups
   */
  getWorkGroups(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/company_work_group/`, { params: data });
  }

  /**
   * Fetch tags
   * @param data request params for tags
   */
  getTags(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tags/`, { params: data });
  }

  /**
   * Fetch users
   * @param data request params for users
   */
  getUsers(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/user_list/`, { params: data });
  }

  /**
   * Update task details
   * @param id Task ID
   * @param body Task payload
   */
  updateTask(id, body): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/${id}/`, body);
  }

  /**
   * Fetch workflows
   * @param data Params for workflows lisitng API
   */
  getWorkFlows(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/workflows/`, { params: data });
  }

  /**
   * Fetch projects
   * @param data Params for workflows lisitng API
   */
  getProjects(data?): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/projects/`, { params: data });
  }

  /**
   * Fetch tasks statistics
   */
  getStatistics(): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks_statistic/`);
  }

  /**
   * Update task ranking
   * @param id Task ID
   * @param data Task payload with ranking
   */
  taskRank(id, data): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/task_rank/${id}/`, data);
  }

  /**
   * Fetch project statistics data for task
   * @param taskId Task ID
   */
  projectStatistic(taskId): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/${taskId}/task_details_statistic/`);
  }

  /**
   * Create Task
   * @param data Task payload
   */
  createTask(data): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/`, data);
  }

  /**
   * Rename task name
   * @param id Task ID
   * @param body Task payload to rename project title
   */
  reNameTaskTitle(id, body): Observable<any> {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/tasks/${id}/rename_title/`, body);
  }

  /**
 * Fetch task template
 * @param taskTemplateId Task Template ID
 */
  getTaskTemplate(taskTemplateId: string): Observable<CustomTaskTemplateOutputModel> {
    return this.http.get<CustomTaskTemplateOutputModel>(`${API_BASE_URL}projects/api/task-templates/${taskTemplateId}/`);
  }


  /**
   * Fetch task templates
   * @param data request params for task templates
   */
  getTaskTemplates(data?): Observable<CustomTaskTemplateOutputModel> {
    return this.http.get<CustomTaskTemplateOutputModel>(`${API_BASE_URL}projects/api/task-templates/`, { params: data });
  }
}
