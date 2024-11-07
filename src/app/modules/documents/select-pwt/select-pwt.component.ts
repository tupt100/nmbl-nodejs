import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { IProject } from '../../projects/project/project.interface';
import { IWorkflow } from '../../projects/workflow/workflow.interface';
import { ITask } from '../../projects/task/task.interface';
import { ProjectService } from '../../projects/project/project.service';
import { WorkflowService } from '../../projects/workflow/workflow.service';
import { TaskService } from '../../projects/task/task.service';

@Component({
  selector: 'app-select-pwt',
  templateUrl: './select-pwt.component.html',
  styleUrls: ['./select-pwt.component.scss']
})
export class SelectPwtComponent implements OnInit {
  /**
   * Bindings
   */
  public arrProjects: Array<IProject> = [];
  public arrWorkflow: Array<IWorkflow> = [];
  public arrTask: Array<ITask> = [];
  public name = '';
  public myForm: FormGroup;
  notCollapsed = {
    projects: true,
    workflows: true,
    tasks: true
  };
  @Input() selected: any;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onValueSelected = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      assignToSearch: null
    });

    Promise.all([
      this.listProjects(),
      this.listWorkflow(),
      this.listTask()
    ]);

    // Project
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.projectService.listProjects({ search: value, limit: 5, status: 1 }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrProjects = res.results as Array<IProject>;
      }
      this.notCollapsed = {
        projects: true,
        workflows: true,
        tasks: true
      };
    });

    // Workflow
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.workflowService.listWorkflow({ search: value, limit: 5, status: 1}))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrWorkflow = res.results as Array<IWorkflow>;
      }
      this.notCollapsed = {
        projects: true,
        workflows: true,
        tasks: true
      };
    });

    // Task
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.taskService.getTasks({ search: value, limit: 5, type: 'active' }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrTask = res.results as Array<ITask>;
      }
      this.notCollapsed = {
        projects: true,
        workflows: true,
        tasks: true
      };
    });
  }

  /**
   * Method to load list of projects for move or copy document.
   */
  listProjects = () => {
    this.projectService.listProjects({
      limit: 5,
      offset: 0,
      status: 1
    }).subscribe(res => {
      if (res && res.results) {
        this.arrProjects = res.results as Array<IProject>;
      }
    });
  }

  /**
   * Method to load list of workflow for move or copy document.
   */
  listWorkflow = () => {
    this.workflowService.listWorkflow({
      limit: 5,
      offset: 0,
      status: 1
    }).subscribe(res => {
      if (res && res.results) {
        this.arrWorkflow = res.results as Array<IWorkflow>;
      }
    });
  }

  /**
   * Method to load list of tasks for move or copy document.
   */
  listTask = () => {
    this.taskService.getTasks({
      limit: 5,
      offset: 0,
      type: 'active'
    }).subscribe(res => {
      if (res && res.results) {
        this.arrTask = res.results as Array<ITask>;
      }
    });
  }

  /**
   * Method to select project to identify copy or move document in selcted project.
   * @param project the selected project object
   */
  selectProject = (project: IProject) => {
    const params = {
      type: 'project',
      name: project.project.name,
      id: project.project.id
    };
    this.name = '';
    this.onValueSelected.emit(params);
  }

  /**
   * Method to select workflow to identify copy or move document in selcted workflow.
   * @param workflow the selected workflow object
   */
  selectWorkflow = (workflow: IWorkflow) => {
    this.name = workflow.workflow.name || '';
    const params = {
      type: 'workflow',
      name: workflow.workflow.name,
      id: workflow.workflow.id
    };
    this.onValueSelected.emit(params);
  }

  /**
   * Method to select task to identify copy or move document in selcted task.
   * @param task the selected task object
   */
  selectTask = (task: ITask) => {
    this.name = task.task.name || '';
    const params = {
      type: 'task',
      name: task.task.name,
      id: task.task.id
    };
    this.onValueSelected.emit(params);
  }
}
