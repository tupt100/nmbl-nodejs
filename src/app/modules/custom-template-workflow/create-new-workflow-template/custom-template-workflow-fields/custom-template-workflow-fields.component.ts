import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow.service';
import { WorkflowService } from '../../../projects/workflow/workflow.service';
import { SharedService } from '../../../../services/sharedService';
import { TaskService } from '../../../projects/task/task.service';
import { ProjectService } from '../../../projects/project/project.service';
import * as moment from 'moment';
import { TaskPriorComponent } from '../../../shared/task-prior/task-prior.component';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import * as _ from 'lodash';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';
import { Subject, forkJoin } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { importanceLevel, Task } from '../../custom-template-model';

@Component({
  selector: 'app-custom-template-workflow-fields',
  templateUrl: './custom-template-workflow-fields.component.html',
  styleUrls: ['./custom-template-workflow-fields.component.scss']
})
export class CustomTemplateWorkflowFieldsComponent implements OnInit, OnDestroy {
  @ViewChild(TaskPriorComponent) taskPrior: TaskPriorComponent;
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public formType = '';
  public workflowForm: FormGroup;
  public objUser$: any;
  public objPermission$: any;
  public importance = null;
  public groupTitle: Array<any> = [];
  public workflowTitle: Array<any> = [];
  public projectTitle: Array<any> = [];
  public tagTitle: Array<any> = [];
  public userTitle: Array<any> = [];
  public tagsList: Array<any> = [];
  public workFlowList: Array<any> = [];
  public projectsList: Array<any> = [];
  public usersList: Array<any> = [];
  public noPermission = false;
  public isLoading = false;
  public filteredWorkflows: Array<any> = [];
  public filteredUsers: Array<any> = [];
  public filteredGroups: Array<any> = [];
  public workGroupList: Array<any> = [];
  public taskDocuments: File[] = [];
  public arrPrivilege: Array<any> = [];
  public isSelfAssign = false;
  setStartToday = false;
  public userId;
  public fileId: Array<any> = [];
  public minDate = new Date();
  permisionList: any = {};
  moduleSubs: any;
  taskTemplateStubs: any;
  workFlowUpdated = false;
  startDate: any;
  dueDate: any;
  templateId: number;
  selectedUserId: number;
  selectedWorkflowId: number;
  selectedProjectId: number;
  selectedGroupIds: number[];
  customTemplate$ = this.customTemplateFacade.getCustomTemplate$;
  taskFields$ = this.customTemplateFacade.getWorkflowField$;
  allowedFormats = this.sharedService.allowedFileFormats.join();
  public isPrivate = false;
  private ngDestroy$ = new Subject();

  constructor(
    formBuilder: FormBuilder,
    private fb: FormBuilder,
    private workFlowService: WorkflowService,
    private sharedService: SharedService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private customTemplateFacade: CustomTemplateFacade,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customTemplateWorkflowService: CustomTemplateWorkflowService
  ) {

  }

  ngOnInit(): void {
    this.initWorkflowForm();

    this.templateId = this.activatedRoute.snapshot.params.id;

    this.formType = 'task';
    this.getLists('user');
    this.getLists('group');
    this.getLists('tag');
    this.initView();
  }

  initView() {
    this.importance = 1;
    this.arrPrivilege = this.sharedService.privilegeList.filter((val: any) => {
      return val;
    });
    this.tagTitle = [];
    this.groupTitle = [];
    this.fileId = [];
    this.taskDocuments = [];

    const inEditModeAndIsFirstLoad = this.templateId && CustomTemplateWorkflowService.prevStep == "new";
    const withBackButton = CustomTemplateWorkflowService.prevStep !== "new";
    if (inEditModeAndIsFirstLoad) {

      this.customTemplateFacade.getTemplateInfo(this.templateId);
      this.customTemplate$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
        if (data) {
          const updateData = () => {
            this.customTemplateFacade.createCustomFields(data.fields);
  
            if (data['workflow'] && data.id == this.templateId) {
              this.updateValues(data['workflow']);
            }
          }
  
          if (data.tasks?.length) {
            const taskRequests = data.tasks.map(task => {
              return this.customTemplateWorkflowService.getTask(task.pk)
            })
            forkJoin(taskRequests).subscribe(res => {
              this.customTemplateFacade.createTasks(res.map(t => new Task(t)))
              updateData()
            })
          } else {
            updateData()
          }  
        }      
      });
    } else if (withBackButton) {
      this.taskFields$.pipe(take(1)).subscribe(data => {
        if (Object.keys(data).length > 0 && this.workflowForm) {

          data.project = data.project.length ? data.project[0].id : data.project;
          data.user = data.user.length ? data.user[0].id : data.user;
          data.group = data.group.length && data.group[0].id ? data.group.map(a => a.id) : data.group;
          this.updateValues(data);

        }
      });
    } else {
      //first load in new task template
      this.customTemplateFacade.createCustomFields([]);
      this.arrPrivilege = this.sharedService.privilegeList.filter((val: any) => {
        val.checked = false;
        return val;
      });
    }

  }

  /**
   * Initialize create workflow form
   */
  initWorkflowForm(): void {
    this.workflowForm = this.fb.group({
      name: [null, Validators.required],
      importance: 1,
      description: null
    });
    this.dueDate = null;
    this.startDate = null;
    this.getLists('projects');
  }

  updateValues(data) {
    const importance = { 1: 'low', 2: 'medium', 3: 'high' };
    this.workflowForm.patchValue(data);
    this.selectedUserId = data.user;
    if (this.usersList.length) {
      this.onFilterSelected([this.selectedUserId], 'user');
    }
    this.selectedWorkflowId = data.workFlow;
    if (this.workFlowList.length) {
      this.onFilterSelected([this.selectedWorkflowId], 'workflows');
    }
    this.selectedProjectId = data.project;
    if (this.projectsList.length) {
      this.onFilterSelected([this.selectedProjectId], 'projects');
    }
    this.selectedGroupIds = data.group;
    if (this.workGroupList.length) {
      this.onFilterSelected(this.selectedGroupIds, 'group');
    }
    this.dueDate = data.dueDate;
    this.startDate = data.startDate;
    this.isPrivate = data.isPrivate;
    this.arrPrivilege.map(p => {
      const pr = data.privileges.filter(tp => tp.id === p.id);
      p.checked = pr[0]?.checked;
    });
    this.importance = importance[data.importance] ?? importanceLevel[data.importance];
  }

  /**
   * Clear project and workflow selections
   * @param workflow Workflow dropdown trigger
   */
  clearPW(workflow): void {
    const title = workflow ? 'workflowTitle' : 'projectTitle';
    const list = workflow ? 'workFlowList' : 'projectsList';

    this[title] = [];
    this[list].map(x => x.checked = false);
  }

  /**
   * Clear project and workflow selections
   * @param group Workflow dropdown trigger
   */
  clearGT(group): void {
    const title = group ? 'groupTitle' : 'projectTitle';
    const list = group ? 'workGroupList' : 'projectsList';

    this[title] = [];
    this[list].map(x => x.checked = false);
  }

  /**
   * Handle privilege checkbox trigger
   * @param event Checkbox change event
   * @param id Privilege ID
   */
  updatePrivilege(event, id) {
    if (event.target.checked) {
      if (id === '') {
        this.arrPrivilege = this.arrPrivilege.map((obj, i) => {
          if (i !== 0) {
            obj.checked = false;
          }
          return obj;
        });
      } else {
        this.arrPrivilege[0].checked = false;
      }
    }
  }

  /**
   * Get users listing
   */
  getUsers = (filteredParams) => {
    this.taskService.getUsers(filteredParams).subscribe(res => {
      if (res) {
        this.setUsersList(res);
      }
    });
  }

  /**
   * Get project listing
   */
  getProjects = (filteredParams) => {
    filteredParams.status = 1;
    this.projectService.listProjects(filteredParams).subscribe(res => {
      this.setProjects(res);
    });
  }

  /**
   * Get workgroups listing
   */
  getWorkGroups = (filteredParams) => {
    this.taskService.getWorkGroups(filteredParams).subscribe(res => {
      if (res) {
        this.setCompanyWorkGroup(res);
      }
    });
  }

  /**
   * Get Tags listing
   */
  getTags = (filteredParams) => {
    this.taskService.getTags(filteredParams).subscribe(res => {
      if (res) {
        this.setTagsList(res);
      }
    });
  }

  /**
   * Set workgroup listing
   * @param res Workgroup response
   */
  setCompanyWorkGroup(res: any): void {
    this.workGroupList = res.results;
    if (this.selectedGroupIds) {
      this.onFilterSelected(this.selectedGroupIds, 'group');
    }
  }

  /**
   * Set tags listing
   * @param res Tags response
   */
  setTagsList(res: any): void {
    const tags: any[] = res.results.map((elem) => {
      elem.name = elem.tag;
      return elem;
    });
    this.tagsList = [...tags];
  }

  /**
   * Set users listing
   * @param res Users response
   */
  setUsersList(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.first_name + ' ' + elem.last_name;
      return elem;
    });
    this.usersList = [...data];
    if (this.selectedUserId) {
      this.onFilterSelected([this.selectedUserId], 'user')
    }
  }

  /**
   * Get workflows listing
   */
  getWorkFlows = (filteredParams) => {
    filteredParams.status = 1;
    this.taskService.getWorkFlows(filteredParams).subscribe(res => {
      if (res) {
        this.setWorkFlows(res);
      }
    });
  }

  /**
   * Set projects listing
   * @param res Projects response
   */
  setProjects(res: any): void {
    const data = res.results.map((elem: any) => {
      return {
        id: elem.project.id,
        name: elem.project.name
      };
    });
    this.projectsList = [...data];
    this.moduleSubs = this.sharedService.moduleCarrier.subscribe(resp => {
      if (resp && resp.type) {
        if (resp.type === 'project') {
          this.projectTitle = resp.data;
        }
      }
    });
    if (this.selectedProjectId) {
      this.onFilterSelected([this.selectedProjectId], 'projects')
    }
  }

  /**
   * Set importance for respective creation form
   * @param value Selected importance
   * @param formtype Form Type
   */
  updateImportance(value, formtype) {
    this.importance = value;
    this[formtype].controls.importance.setValue(value);
  }

  /**
   * Set workflows listing
   * @param res Workflows response
   */
  setWorkFlows(res: any): void {
    const data = res.results.map((elem: any) => {
      return {
        id: elem.workflow.id,
        name: elem.workflow.name
      };
    });
    this.workFlowList = [...data];
    this.moduleSubs = this.sharedService.moduleCarrier.subscribe(resp => {
      if (resp && resp.type) {
        if (resp.type === 'workflow') {
          this.workflowTitle = resp.data;
        }
      }
    });
    if (this.selectedWorkflowId) {
      this.onFilterSelected([this.selectedWorkflowId], 'workflows')
    }
  }

  /*** Minimum date validation for due date
   */
  getMinDate() {
    return this.startDate || this.minDate;
  }

  /**
   * Trigger when assignee dropdown selection changed
   * @param groupObj Assignments array
   * @param filterType Assignee dropdown type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'group':
        this.setFilterTitle('workGroupList', 'groupTitle', groupObj);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj, 'tag');
        break;
      case 'workflows':
        if (this.workflowTitle && this.workflowTitle.length && groupObj.length > 1) {
          this.onSingleFilterSelected('workFlowList', 'workflowTitle', groupObj);
        }
        this.setFilterTitle('workFlowList', 'workflowTitle', groupObj);
        this.workFlowUpdated = true;
        break;
      case 'projects':
        if (this.projectTitle && this.projectTitle.length && groupObj.length > 1) {
          this.onSingleFilterSelected('projectsList', 'projectTitle', groupObj);
        }
        this.setFilterTitle('projectsList', 'projectTitle', groupObj);
        break;
      case 'user':
        if (this.userTitle && this.userTitle.length && this.formType === 'task' && groupObj.length > 1) {
          this.onSingleFilterSelected('usersList', 'userTitle', groupObj);
        }
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
    }
  }

  /**
   * Handle assignment dropdown selections
   * @param data Dropdown list
   * @param title Assignee dropdown list
   * @param groupObj Assignments array
   * @param filter Assignee dropdown type (optional special case for tags)
   */
  setFilterTitle(data, title, groupObj, filter?) {
    const ad = [];
    if (this[data] && this[data].length) {
      this[data].forEach(x => {
        if (groupObj.indexOf(x.id) > -1) {
          ad.push(x);
        }
      });
    } else if (filter === 'tag') {
      if (groupObj && groupObj.length) {
        groupObj.forEach(tag => {
          if (typeof tag === 'string') {
            ad.push({ id: tag, tag });
          }
        });
      }
    }
    if (filter === 'tag') {
      this.getLists('tag');
    }
    // const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = [...ad];
    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Handle single selection for workflows and status
   * @param filterType Dropdown type
   * @param title Dropdown selection list
   * @param groupObj selections
   */
  onSingleFilterSelected(filterType, title, groupObj): void {
    const index = groupObj.indexOf(this[title][0].id);

    if (index > -1) {
      groupObj.splice(index, 1);
    }
    if (title === 'userTitle') {
      this.isSelfAssign = groupObj[0] === this.userId;
    }
    this.filterOptions(filterType, groupObj);
  }

  /**
   * Set checked for single selection
   * @param filterType Dropdown type
   * @param groupObj Selections
   */
  filterOptions(filterType, groupObj) {
    this[filterType].map((elem: any) => {
      elem.checked = (+elem.id === +groupObj) ? true : false;
    });
  }


  /**
   * Return dropdown listing
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: 100,
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        return this.getUsers(filteredParams);
      case 'group':
        return this.getWorkGroups(filteredParams);
      case 'tag':
        if (search && search.keyCode === 13) {
          delete filteredParams.search;
        }
        return this.getTags(filteredParams);
      case 'workflows':
        return this.getWorkFlows(filteredParams);
      case 'projects':
        return this.getProjects(filteredParams);
    }
  }

  /**
   * Show error message
   * @param msg Message
   */
  showErrorMessage(msg: string): void {
    window.scroll(0, 0);
    this.notifier.displayErrorMsg(msg);
  }


  /**
   * Added clear due date trigger in datepicker
   */
  onOpenCalendar = () => {
    const div = document.getElementsByTagName('bs-datepicker-navigation-view');
    const a = document.createElement('a');
    a.className = 'secondary-link';
    a.innerHTML = 'Clear';
    a.onclick = this.clear;
    div[0].appendChild(a);
  }

  /**
   * Clear due date
   */
  clear = () => {
    this.dueDate = null;
  }


  createWorkflow() {
    let data = this.workflowForm.value;
    const group = this.groupTitle;
    const project = this.projectTitle;
    const user = this.userTitle;
    const isPrivate = this.isPrivate;
    const privileges = this.arrPrivilege.filter(p => p.title !== 'None');
    const startDate = this.startDate;
    const dueDate = this.dueDate;
    data = { ...data, project, user, group, startDate, dueDate, isPrivate, privileges };
    this.customTemplateFacade.createWorkflowField(data);

    this.customTemplateWorkflowService.changeWizardStep('custom-field', 'workflow-fields');
  }

  ngOnDestroy() {
    if (this.moduleSubs) {
      this.sharedService.moduleCarrier.next({ type: '', data: [] });
      this.moduleSubs.unsubscribe();
    }

    if (this.taskTemplateStubs) {
      this.taskTemplateStubs.unsubscribe();
    }
  }
}
