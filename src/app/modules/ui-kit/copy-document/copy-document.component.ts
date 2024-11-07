import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { ProjectService } from '../../projects/project/project.service';
import { WorkflowService } from '../../projects/workflow/workflow.service';
import { TaskService } from '../../projects/task/task.service';
import { IProject } from '../../projects/project/project.interface';
import { IWorkflow } from '../../projects/workflow/workflow.interface';
import { ITask } from '../../projects/task/task.interface';
import { SharedService } from 'src/app/services/sharedService';
import { Messages } from 'src/app/services/messages';

@Component({
  selector: 'app-copy-document',
  templateUrl: './copy-document.component.html',
  styleUrls: ['./copy-document.component.scss']
})
export class CopyDocumentComponent implements OnInit {

  /**
   * Bindings
   */
  public defaultParams = {
    limit: 5,
    offset: 0,
  };
  public arrProjects: Array<IProject> = [];
  public arrWorkflow: Array<IWorkflow> = [];
  public arrTask: Array<ITask> = [];
  public name = '';
  public myForm: FormGroup;
  public isLoading = false;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onValueSelected = new EventEmitter();

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.onClose.emit(false);
    }
  }

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    // Initialze search form
    this.myForm = this.fb.group({
      assignToSearch: null,
      assignToSearch1: null
    });

    // Search projects
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.projectService.listProjects({ search: value, limit: 5 })
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrProjects = res.results as Array<IProject>;
      }
    });

    // Search workflows
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.workflowService.listWorkflow({ search: value, limit: 5 })
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrWorkflow = res.results as Array<IWorkflow>;
      }
    });

    // Search tasks
    this.myForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.taskService.getTasks({ search: value, limit: 5, private: true })
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrTask = res.results as Array<ITask>;
      }
    });

    this.listProjects();
    this.listWorkflow();
    this.listTask();
  }

  /**
   * Get projects listing
   */
  listProjects = () => {
    this.projectService.listProjects(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.arrProjects = res.results as Array<IProject>;
      }
    });
  }

  /**
   * Get workflows lisitngs
   */
  listWorkflow = () => {
    this.workflowService.listWorkflow(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.arrWorkflow = res.results as Array<IWorkflow>;
      }
    });
  }

  /**
   * Get tasks listing
   */
  listTask = () => {
    const params = { ...this.defaultParams };
    params['private'] = false;
    this.taskService.getTasks(params).subscribe(res => {
      if (res && res.results) {
        this.arrTask = res.results as Array<ITask>;
      }
    });
  }

  /**
   * Trigger when user select any project
   * @param project: Project
   */
  selectProject = (project: IProject) => {
    this.name = project.project.name || '';
    const params = {
      type: 'project',
      name: project.project.name,
      id: project.project.id
    };
    this.onValueSelected.emit(params);
    this.arrProjects = [];
    this.arrWorkflow = [];
    this.arrTask = [];
    this.isLoading = false;
  }

  /**
   * Trigger when user select any workflow
   * @param project: Workflow
   */
  selectWorkflow = (workflow: IWorkflow) => {
    this.name = workflow.workflow.name || '';
    const params = {
      type: 'workflow',
      name: workflow.workflow.name,
      id: workflow.workflow.id
    };
    this.onValueSelected.emit(params);
    this.arrProjects = [];
    this.arrWorkflow = [];
    this.arrTask = [];
    this.isLoading = false;
  }

  /**
   * Trigger when user select any task
   * @param project: Task
   */
  selectTask = (task: ITask) => {
    this.name = task.task.name || '';
    const params = {
      type: 'task',
      name: task.task.name,
      id: task.task.id
    };
    this.onValueSelected.emit(params);
    this.arrProjects = [];
    this.arrWorkflow = [];
    this.arrTask = [];
    this.isLoading = false;
  }

  /**
   * Trigger when user click copy button
   */
  onSubmit() {
    if (!this.name || this.name.trim() === '') {
      return this.sharedService.errorMessage.next(Messages.errors.copyDocErr);
    }
    this.onClose.emit(true);
  }

  /**
   * Close copy document popup
   */
  cancel(): void {
    this.onClose.emit(false);
  }
}
