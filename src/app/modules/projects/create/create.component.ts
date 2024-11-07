import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/sharedService';
import { TaskService } from '../task/task.service';
import { Store } from '@ngrx/store';
import { Messages } from 'src/app/services/messages';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../workflow/workflow.service';
import { ProjectService } from '../project/project.service';
import { TaskPriorComponent } from '../../shared/task-prior/task-prior.component';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import * as moment from 'moment';
import * as fromRoot from '../../../store';
import * as _ from 'lodash';
import { CustomTaskTemplateOutputModel } from '../../custom-template-task/custom-template-model';
import { CustomTemplateFacade } from '../../custom-template-task/+state/custom-template.facade';
import { CustomTemplateFacade as CustomWorkflowTemplateFacade } from '../../custom-template-workflow/+state/custom-template.facade';
import { CustomTemplateFacade as CustomProjectTemplateFacade } from '../../custom-template-project/+state/custom-template.facade';


import { CustomTemplateTaskService } from '../../custom-template-task/custom-template-task.service';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow/custom-template-workflow.service';
import { CustomTemplateWorkflowService as CustomTemplateProjectService } from '../../custom-template-project/custom-template-workflow.service';
import { GlobalCustomFieldService } from '../../custom-fields/custom-field.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  @ViewChild(TaskPriorComponent) taskPrior: TaskPriorComponent;
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public formType = '';
  public taskForm: FormGroup;
  public workflowForm: FormGroup;
  public projectForm: FormGroup;
  public objUser$: any;
  public objPermission$: any;
  public objFeatures$: any;
  public importance = null;
  public groupTitle: Array<any> = [];
  public workflowTitle: Array<any> = [];
  public projectTitle: Array<any> = [];
  public tagTitle: Array<any> = [];
  public userTitle: Array<any> = [];
  public taskTemplateTitle: Array<any> = [];
  public workflowTemplateTitle: Array<any> = [];
  public projectTemplateTitle: Array<any> = [];
  public tagsList: Array<any> = [];
  public workFlowList: Array<any> = [];
  public projectsList: Array<any> = [];
  public usersList: Array<any> = [];
  public taskTemplateList: Array<any> = [];
  public workflowTemplateList: Array<any> = [];
  public projectTemplateList: Array<any> = [];
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
  templateFeatureIsActiveAndHasPermission = false;
  moduleSubs: any;
  uploadedFile = [];
  workFlowUpdated = false;
  startDate: any;
  dueDate: any;
  allowedFormats = this.sharedService.allowedFileFormats.join();
  public isPrivate = false;
  taskTemplate: CustomTaskTemplateOutputModel;
  workflowTemplate: any;
  projectTemplate: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workFlowService: WorkflowService,
    private sharedService: SharedService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private customTemplateFacade: CustomTemplateFacade,
    private customWorkflowTemplateFacade: CustomWorkflowTemplateFacade,
    private customProjectTemplateFacade: CustomProjectTemplateFacade,
    private store: Store<fromRoot.AppState>,
    private customTemplateTaskService: CustomTemplateTaskService,
    private customTemplateWorkflowService: CustomTemplateWorkflowService,
    private customTemplateProjectService: CustomTemplateProjectService,
    private globalCustomFieldService: GlobalCustomFieldService
  ) { }

  ngOnInit() {
    const activatedroute = this.route.snapshot;
    this.objUser$ = this.store.select('userDetails').subscribe((res: any) => {
      if (res.loaded) {
        this.userId = res.datas.id;
      }
    });
    // Check user permission for creating P/W/T
    this.objPermission$ = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (!this.hasPermission(activatedroute.routeConfig.path)) {
            return this.noPermission = true;
          } else {
            this.getLists('user');
            this.getLists('group');
            this.getLists('tag');

            this.formType = activatedroute.routeConfig.path;
            this.noPermission = false;
            this.initView();
          }
          if (this.formType === "task") {
            this.objFeatures$ = this.store.select('features').subscribe((features) => {
              if (features.loaded && features.datas && features.datas.features) {
                if (features.datas.features.TASKTEMPLATE) {
                  if (this.permisionList.tasktemplate_tasktemplate_view ||
                    this.permisionList.tasktemplate_tasktemplate_view_all) {
                    this.templateFeatureIsActiveAndHasPermission = true;
                    this.getLists('taskTemplates');
                  }
                }
              }
            });

          }

          if (this.formType === "workflow") {
            this.objFeatures$ = this.store.select('features').subscribe((features) => {
              if (features.loaded && features.datas && features.datas.features) {
                if (features.datas.features.TASKTEMPLATE) {
                  if (this.permisionList.tasktemplate_tasktemplate_view ||
                    this.permisionList.tasktemplate_tasktemplate_view_all) {
                    this.templateFeatureIsActiveAndHasPermission = true;
                    this.getLists('workflowTemplates');
                  }
                }
              }
            });

          }

          if (this.formType === "project") {
            this.objFeatures$ = this.store.select('features').subscribe((features) => {
              if (features.loaded && features.datas && features.datas.features) {
                if (features.datas.features.TASKTEMPLATE) {
                  if (this.permisionList.tasktemplate_tasktemplate_view ||
                    this.permisionList.tasktemplate_tasktemplate_view_all) {
                    this.templateFeatureIsActiveAndHasPermission = true;
                    this.getLists('projectTemplates');
                  }
                }
              }
            });

          }
          this.objFeatures$ = this.store.select('features').subscribe((features) => {
            if (features.loaded && features.datas && features.datas.features) {
              if (features.datas.features.GLOBALCUSTOMFIELD) {
                this.getGlobalCustomFields();
              }
            }
          });
        }
      }
    });
  }

  setGlobalFormFields(form, data) {
    const fields = form.get('globalFields') as FormArray;
    fields.clear();
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    data.forEach(item => (fields.push(this.fb.group({
      pk: item.pk,
      label: [{ value: item.label, disabled: false }],
      value: [{ value: item.default_value, disabled: false }],
      fieldType: [{ value: item.field_type, disabled: false }],
      description: [{ value: item.description, disabled: false }],
      isRequired: item.is_required,
      controlType: getControlType(item.field_type)
    }))));
  }

  getGlobalCustomFields() {
    this.globalCustomFieldService.getGlabalCustomFields({}).subscribe(res => {
      if (res) {
        if (this.formType === 'task') {
          this.setGlobalFormFields(
            this.taskForm,
            res.results.filter(f => f.allow_content_type.includes('task'))
          )
        } else if (this.formType === 'workflow') {
          this.setGlobalFormFields(
            this.workflowForm,
            res.results.filter(f => f.allow_content_type.includes('workflow'))
          )
        } else if (this.formType === 'project') {
          this.setGlobalFormFields(
            this.projectForm,
            res.results.filter(f => f.allow_content_type.includes('project'))
          )
        }
      }
    })
  }

  /**
   * Initialize creation view
   */
  initView() {
    this.importance = 1;
    this.arrPrivilege = this.sharedService.privilegeList.filter((val: any) => {
      val.checked = false;
      return val;
    });
    this.tagTitle = [];
    this.groupTitle = [];
    this.fileId = [];
    this.taskDocuments = [];
    if (this.formType === 'task') {
      this.initTaskForm();
    } else if (this.formType === 'workflow') {
      this.initWorkFlowForm();
    } else if (this.formType === 'project') {
      this.initProjectForm();
    }
  }

  /**
   * Return true if user has permission to create given P/W/T
   * @param type Modal type
   */
  hasPermission(type): boolean {
    switch (type) {
      case 'task':
        return this.permisionList.task_task_create;

      case 'workflow':
        return this.permisionList.workflow_workflow_create;

      default:
        return this.permisionList.project_project_create;
    }
  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.objPermission$) {
      this.objPermission$.unsubscribe();
    }
    if (this.objFeatures$) {
      this.objFeatures$.unsubscribe();
    }
    if (this.objUser$) {
      this.objUser$.unsubscribe();
    }

    if (this.moduleSubs) {
      this.sharedService.moduleCarrier.next({ type: '', data: [] });
      this.moduleSubs.unsubscribe();
    }
  }

  /**
   * Initialize create task form
   */
  initTaskForm(): void {
    this.taskForm = this.fb.group({
      name: [null, Validators.required],
      importance: 1,
      description: null,
      fields: this.fb.array([]),
      globalFields: this.fb.array([]),
    });
    this.dueDate = moment().toDate();
    this.startDate = null;
    this.getLists('workflows');
  }

  checkTaskTemplateExists() {
    return !!this.taskTemplate;
  }

  applyTaskTemplate() {
    this.applyTaskTemplateGeneralFields();
    this.applyTaskTemplateGroup();
    this.applyTaskTemplateUser();
    this.applyTaskTemplateWorkflow();
  }

  applyTaskTemplateGeneralFields() {
    if (!this.checkTaskTemplateExists()) return;
    this.taskForm.patchValue({
      name: this.taskTemplate.task_name,
      description: this.taskTemplate.description
    })
    this.applyTaskTemplateCustomFields(this.taskTemplate.customfield_set);
    this.isPrivate = this.taskTemplate.is_private;
    if (this.taskTemplate.start_date) {
      this.startDate = moment().add(this.taskTemplate.start_date, 'days').toDate();
    }
    if (this.taskTemplate.due_date) {
      this.dueDate = moment().add(this.taskTemplate.due_date, 'days').toDate();
    }
    if (this.taskTemplate.importance) {
      this.updateImportance(this.taskTemplate.importance, 'taskForm')
    }
    this.applyTaskTemplatePrivilages();
  }
  applyTaskTemplatePrivilages = () => {
    if (!this.checkTaskTemplateExists()) return;
    this.arrPrivilege.forEach(item => {
      item.checked = !!this.taskTemplate[item.id];
    })
  }
  applyTaskTemplateUser = () => {
    if (!this.checkTaskTemplateExists()) return;
    if (this.taskTemplate.assigned_to_id) {
      this.onFilterSelected([this.taskTemplate.assigned_to_id], 'user');
    }
  }
  applyTaskTemplateWorkflow = () => {
    if (!this.checkTaskTemplateExists()) return;
    if (this.taskTemplate.workflow_id) {
      this.onFilterSelected([this.taskTemplate.workflow_id], 'workflows');
    }
  }
  applyTaskTemplateGroup = () => {
    if (!this.checkTaskTemplateExists()) return;
    if (this.taskTemplate.assigned_to_group.length) {
      this.onFilterSelected(this.taskTemplate.assigned_to_group, 'group');
    }
  }
  applyTaskTemplateCustomFields(data) {
    const fields = this.taskForm.get('fields') as FormArray;
    fields.clear();
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    data.forEach(item => (fields.push(this.fb.group({
      pk: item.pk,
      label: [{ value: item.label, disabled: false }],
      value: [{ value: item.default_value, disabled: false }],
      fieldType: [{ value: item.field_type, disabled: false }],
      description: [{ value: item.description, disabled: false }],
      isRequired: item.is_required,
      controlType: getControlType(item.field_type)
    }))));
  }

  checkWorkflowTemplateExists() {
    return !!this.workflowTemplate;
  }

  applyWorkflowTemplate() {
    this.applyWorkflowTemplateGeneralFields();
    this.applyWorkflowTemplateGroup();
    this.applyWorkflowTemplateUser();
    this.applyWorkflowTemplateWorkflow();
  }
  
  applyWorkflowTemplateGeneralFields() {
    if (!this.checkWorkflowTemplateExists()) return;
    this.workflowForm.patchValue({
      name: this.workflowTemplate.name,
      description: this.workflowTemplate.description
    })
    this.applyWorkflowTemplateCustomFields(this.workflowTemplate.custom_fields);
    this.isPrivate = this.workflowTemplate.is_private;
    if (this.workflowTemplate.start_date) {
      this.startDate = moment().add(this.workflowTemplate.start_date, 'days').toDate();
    }
    if (this.workflowTemplate.due_date) {
      this.dueDate = moment().add(this.workflowTemplate.due_date, 'days').toDate();
    }
    if (this.workflowTemplate.importance) {
      this.updateImportance(this.workflowTemplate.importance, 'workflowForm')
    }
    this.applyWorkflowTemplatePrivilages();
  }
  applyWorkflowTemplatePrivilages = () => {
    if (!this.checkWorkflowTemplateExists()) return;
    this.arrPrivilege.forEach(item => {
      item.checked = !!this.workflowTemplate[item.id];
    })
  }
  applyWorkflowTemplateUser = () => {
    if (!this.checkWorkflowTemplateExists()) return;
    if (this.workflowTemplate.assigned_to_users?.length) {
      this.onFilterSelected(this.workflowTemplate.assigned_to_users.map(u => u.id), 'user');
    }
  }
  applyWorkflowTemplateWorkflow = () => {
    if (!this.checkWorkflowTemplateExists()) return;
    const projectId = this.workflowTemplate.project_id || this.workflowTemplate.project?.id
    if (projectId) {
      this.onFilterSelected([projectId], 'projects');
    }
  }
  applyWorkflowTemplateGroup = () => {
    if (!this.checkWorkflowTemplateExists()) return;
    if (this.workflowTemplate.assigned_to_group?.length) {
      this.onFilterSelected(this.workflowTemplate.assigned_to_group.map(g => g.id), 'group');
    }
  }
  applyWorkflowTemplateCustomFields(data) {
    const fields = this.workflowForm.get('fields') as FormArray;
    fields.clear();
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }
  
      return "text";
    }
    data.forEach(item => (fields.push(this.fb.group({
      pk: item.pk,
      label: [{ value: item.label, disabled: false }],
      value: [{ value: item.default_value, disabled: false }],
      fieldType: [{ value: item.field_type, disabled: false }],
      description: [{ value: item.description, disabled: false }],
      isRequired: item.is_required,
      controlType: getControlType(item.field_type)
    }))));
  }

  checkProjectTemplateExists() {
    return !!this.projectTemplate;
  }
  
  applyProjectTemplate() {
    this.applyProjectTemplateGeneralFields();
    this.applyProjectTemplateGroup();
    this.applyProjectTemplateUser();
  }
  
  applyProjectTemplateGeneralFields() {
    if (!this.checkProjectTemplateExists()) return;
    this.projectForm.patchValue({
      name: this.projectTemplate.name,
      description: this.projectTemplate.description
    })
    this.applyProjectTemplateCustomFields(this.projectTemplate.custom_fields);
    this.isPrivate = this.projectTemplate.is_private;
    if (this.projectTemplate.start_date) {
      this.startDate = moment().add(this.projectTemplate.start_date, 'days').toDate();
    }
    if (this.projectTemplate.due_date) {
      this.dueDate = moment().add(this.projectTemplate.due_date, 'days').toDate();
    }
    if (this.projectTemplate.importance) {
      this.updateImportance(this.projectTemplate.importance, 'projectForm')
    }
    this.applyProjectTemplatePrivilages();
  }
  applyProjectTemplatePrivilages = () => {
    if (!this.checkProjectTemplateExists()) return;
    this.arrPrivilege.forEach(item => {
      item.checked = !!this.projectTemplate[item.id];
    })
  }
  applyProjectTemplateUser = () => {
    if (!this.checkProjectTemplateExists()) return;
    if (this.projectTemplate.assigned_to_users?.length) {
      this.onFilterSelected(this.projectTemplate.assigned_to_users.map(u => u.id), 'user');
    }
  }
  applyProjectTemplateGroup = () => {
    if (!this.checkProjectTemplateExists()) return;
    if (this.projectTemplate.assigned_to_group?.length) {
      this.onFilterSelected(this.projectTemplate.assigned_to_group.map(g => g.id), 'group');
    }
  }
  applyProjectTemplateCustomFields(data) {
    const fields = this.projectForm.get('fields') as FormArray;
    fields.clear();
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }
  
      return "text";
    }
    data.forEach(item => (fields.push(this.fb.group({
      pk: item.pk,
      label: [{ value: item.label, disabled: false }],
      value: [{ value: item.default_value, disabled: false }],
      fieldType: [{ value: item.field_type, disabled: false }],
      description: [{ value: item.description, disabled: false }],
      isRequired: item.is_required,
      controlType: getControlType(item.field_type)
    }))));
  }

  /**
   * Initialize create workflow form
   */
  initWorkFlowForm(): void {
    this.workflowForm = this.fb.group({
      name: [null, Validators.required],
      importance: 1,
      project: null,
      description: null,
      fields: this.fb.array([]),
      globalFields: this.fb.array([]),
    });
    this.dueDate = moment().toDate();
    this.startDate = null;
    this.getLists('projects');
  }

  /**
   * Initialize create project form
   */
  initProjectForm(): void {
    this.projectForm = this.fb.group({
      name: [null, Validators.required],
      importance: 1,
      description: null,
      fields: this.fb.array([]),
      globalFields: this.fb.array([]),
    });
    this.dueDate = moment().toDate();
    this.startDate = null;
  }

  /**
   * Get workflows listing for task form
   */
  getDefaultWorkflows() {
    this.workFlowService.listWorkflow({ status: 1 }).subscribe(res => {
      this.setWorkFlows(res);
    });
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
  }

  /**
 * Set users listing
 * @param res Users response
 */
  setTaskTemplates(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.name;
      elem.id = elem.pk;
      return elem;
    });
    this.taskTemplateList = [...data];
  }

  setWorkflowTemplates(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.name;
      elem.id = elem.pk;
      return elem;
    });
    this.workflowTemplateList = [...data];
  }

  setProjectTemplates(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.name;
      elem.id = elem.pk;
      return elem;
    });
    this.projectTemplateList = [...data];
  }

  /**
   * Get workgroups
   */
  getDefaultGroups() {
    this.taskService.getWorkGroups().subscribe(res => {
      if (res) {
        this.setCompanyWorkGroup(res);
      }
    });
  }

  /**
   * Set workgroup listing
   * @param res Workgroup response
   */
  setCompanyWorkGroup(res: any): void {
    this.workGroupList = res.results;
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
          if (i !== 0) { obj.checked = false; }
          return obj;
        });
      } else {
        this.arrPrivilege[0].checked = false;
      }
    }
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
   * Set importance for respective creation form
   * @param value Selected importance
   * @param formtype Form Type
   */
  updateImportance(value, formtype) {
    this.importance = value;
    this[formtype].controls.importance.setValue(value);
  }

  /**
   * Set start date as current date or null
   * @param event Checkbox change event
   */
  setCurrentDate(event) {
    this.startDate = event.target.checked ? new Date() : null;
  }

  /**
   * Handler for start date change event
   * @param event Datepicker date change event
   */
  updateStartDateCheckbox(event) {
    if (event && this.startDate) {
      const iscurrentDate = moment(this.startDate).isSame(moment(), 'day');
      if (!iscurrentDate) {
        this.setStartToday = false;
      } else {
        if (!this.setStartToday) {
          this.setStartToday = true;
        }
      }
      if (this.dueDate) {
        if (moment(this.startDate).isAfter(moment(this.dueDate))) {
          this.dueDate = this.startDate;
        }
      }
    }
  }

  /**
   * Minimum date validation for due date
   */
  getMinDate() {
    return this.startDate || this.minDate;
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
    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
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
   * Get users lisitng
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
 * Get task template lisitng
 */
  getTaskTemplates = (filteredParams) => {
    this.taskService.getTaskTemplates(filteredParams).subscribe(res => {
      if (res) {
        this.setTaskTemplates(res);
      }
    });
  }

  getWorkflowTemplates = (filteredParams) => {
    this.workFlowService.getWorkflowTemplates(filteredParams).subscribe(res => {
      if (res) {
        this.setWorkflowTemplates(res);
      }
    });
  }

  getProjectTemplates = (filteredParams) => {
    this.projectService.getProjectTemplates(filteredParams).subscribe(res => {
      if (res) {
        this.setProjectTemplates(res);
      }
    });
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
        if (this.workflowTitle && this.workflowTitle.length) {
          this.onSingleFilterSelected('workFlowList', 'workflowTitle', groupObj);
        }
        this.setFilterTitle('workFlowList', 'workflowTitle', groupObj);
        this.workFlowUpdated = true;
        break;
      case 'projects':
        if (this.projectTitle && this.projectTitle.length) {
          this.onSingleFilterSelected('projectsList', 'projectTitle', groupObj);
        }
        this.setFilterTitle('projectsList', 'projectTitle', groupObj);
        break;
      case 'user':
        if (this.userTitle && this.userTitle.length && this.formType === 'task') {
          this.onSingleFilterSelected('usersList', 'userTitle', groupObj);
        }
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
      case 'taskTemplates':
        if (this.taskTemplateTitle && this.taskTemplateTitle.length && this.formType === 'task') {
          this.onSingleFilterSelected('taskTemplateList', 'taskTemplateTitle', groupObj);
        }
        this.setFilterTitle('taskTemplateList', 'taskTemplateTitle', groupObj);

        this.taskTemplate = this.taskTemplateList.find(a => a.pk === groupObj[0]);
        this.applyTaskTemplate();
        break;

      case 'workflowTemplates':
        if (this.workflowTemplateTitle && this.workflowTemplateTitle.length && this.formType === 'workflow') {
          this.onSingleFilterSelected('workflowTemplateList', 'workflowTemplateTitle', groupObj);
        }
        this.setFilterTitle('workflowTemplateList', 'workflowTemplateTitle', groupObj);

        this.customTemplateWorkflowService.getCustomWorkflowTemplateDetails(groupObj[0]).subscribe(res => {
          this.workflowTemplate = res;
          this.applyWorkflowTemplate();
        })
        break;

      case 'projectTemplates':
        if (this.projectTemplateTitle && this.projectTemplateTitle.length && this.formType === 'project') {
          this.onSingleFilterSelected('projectTemplateList', 'projectTemplateTitle', groupObj);
        }
        this.setFilterTitle('projectTemplateList', 'projectTemplateTitle', groupObj);
        this.customTemplateProjectService.getCustomWorkflowTemplateDetails(groupObj[0]).subscribe(res => {
          this.projectTemplate = res;
          this.applyProjectTemplate();
        })

        break;
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
   * Handle assign to myself checkbox
   * @param event Checkbox change event
   */
  checkSelfAssign(event) {
    const value = event.target.checked ? this.userId : '';
    const index = this.usersList.findIndex((x) => {
      return +x.id === +this.userId;
    });
    if (value) {
      if (index > -1) {
        this.userTitle = [this.usersList[index]];
        this.filterOptions('usersList', [this.userId]);
      } else {
        this.userTitle = [];
      }
    } else {
      this.userTitle = [];
      if (index > -1) {
        this.usersList[index].checked = false;
      }
    }
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
      case 'taskTemplates':
        return this.getTaskTemplates(filteredParams);
      case 'workflowTemplates':
        return this.getWorkflowTemplates(filteredParams);
      case 'projectTemplates':
        return this.getProjectTemplates(filteredParams);
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
   * Upload doc if any and handle create task trigger
   */
  createTask() {
    if (!this.userTitle.length && !this.groupTitle.length) {
      return this.showErrorMessage(Messages.errors.assignTask);
    }

    const data = this.taskForm.value;
    this.setParamNCreateTask(data);
  }

  /**
   * Set payload for creating task
   * @param data Task form data
   */
  setParamNCreateTask(data: any) {
    if (this.permisionList.task_create_edit_privilege_selector) {
      this.arrPrivilege.forEach((val) => {
        if (val.id !== '') {
          data[val.id] = val.checked;
        }
      });
    }
    data.is_private = this.isPrivate;
    data.start_date = this.startDate ? this.sharedService.formatDate(this.startDate) : null;
    data.due_date = this.dueDate ? this.sharedService.formatDate(this.dueDate) : null;
    data.task_tags = [];
    data.assigned_to_group = [];
    this.tagTitle.forEach((val) => {
      data.task_tags.push(val.tag);
    });
    this.groupTitle.forEach((val) => {
      data.assigned_to_group.push(val.id);
    });
    data.attachments = this.fileId;
    data.status = 1;
    data.assigned_to = this.userTitle && this.userTitle.length ? this.userTitle[0].id : null;
    data.workflow = this.workflowTitle && this.workflowTitle.length ? this.workflowTitle[0].id : null;
    data.prior_task = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.prior_task ? this.taskPrior.priorData.prior_task : null;
    data.after_task = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.after_task ? this.taskPrior.priorData.after_task : null;

    // task template
    if (this.taskTemplate) {
      data.task_template_id = this.taskTemplate["pk"];
      const customFieldsValue = {};
      this.taskForm.value.fields.forEach(field => {
        customFieldsValue[field.pk] = field.value;
      });
      data.custom_fields_value = customFieldsValue;
    }


    this.taskService.createTask(data).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.success.taskCreated);
      if (res && res.task_id) {
        const globalFields = this.taskForm.value.globalFields
        if (globalFields?.length) {
          const payload = []
          globalFields.forEach(field => {
            payload.push({
              global_custom_field_id: field.pk,
              value: field.value,
              object_id: res.task_id,
              content_type: "task"
            })
          });
          this.globalCustomFieldService.createCustomFieldValues(payload).subscribe(() => {
            this.router.navigate(['/main/projects/tasks', res.task_id]);
          })
        } else {
          this.router.navigate(['/main/projects/tasks', res.task_id]);
        }
      }
    });
  }

  getDuration(end) {
    var now = moment(new Date());
    return moment(end).diff(now, 'days') + 1
  }

  addNewTaskTemplate() {
    const data = this.taskForm.value;
    data.taskName = data.name;
    if (this.permisionList.task_create_edit_privilege_selector) {
      data.privileges = this.arrPrivilege;
    }
    data.is_private = this.isPrivate;
    data.start_date = this.startDate ? this.getDuration(this.startDate) : null;
    data.due_date = this.dueDate ? this.getDuration(this.dueDate) : null;
    data.status = 1;
    data.user = this.userTitle;
    data.workFlow = this.workflowTitle;
    data.group = this.groupTitle;
    // data.fromOutOfPage = true;
    this.customTemplateFacade.createCustomFields([]);
    this.customTemplateFacade.createTaskField(data);
    // this.customTemplateTaskService.changeWizardStep("custom-field");
    this.router.navigate(['/main/custom-template-task/create'],
      { queryParams: { step: "custom-field" } });
  }

  addNewWorkflowTemplate() {
    const data = this.workflowForm.value;
    if (this.permisionList.task_create_edit_privilege_selector) {
      data.privileges = this.arrPrivilege;
    }
    data.is_private = this.isPrivate;
    data.start_date = this.startDate ? this.getDuration(this.startDate) : null;
    data.due_date = this.dueDate ? this.getDuration(this.dueDate) : null;
    data.status = 1;
    data.user = this.userTitle;
    data.project = this.projectTitle;
    data.group = this.groupTitle;
    this.customWorkflowTemplateFacade.createCustomFields([]);
    this.customWorkflowTemplateFacade.createWorkflowField(data);
    this.router.navigate(['/main/custom-template-workflow/create'],
      { queryParams: { step: "custom-field" } });
  }

  addNewProjectTemplate() {
    const data = this.projectForm.value;
    if (this.permisionList.task_create_edit_privilege_selector) {
      data.privileges = this.arrPrivilege;
    }
    data.is_private = this.isPrivate;
    data.start_date = this.startDate ? this.getDuration(this.startDate) : null;
    data.due_date = this.dueDate ? this.getDuration(this.dueDate) : null;
    data.status = 1;
    data.user = this.userTitle;
    data.project = this.projectTitle;
    data.group = this.groupTitle;
    this.customProjectTemplateFacade.createCustomFields([]);
    this.customProjectTemplateFacade.createWorkflowField(data);
    this.router.navigate(['/main/custom-template-project/create'],
      { queryParams: { step: "custom-field" } });
  }

  /**
   * Upload doc if any and handle create workflow trigger
   */
  createWorkflow() {
    if (!this.userTitle.length && !this.groupTitle.length) {
      return this.showErrorMessage(Messages.errors.assignWorkflow);
    }

    const data = this.workflowForm.value;
    this.setParamNCreateWorflow(data);

  }

  /**
   * Set payload for creating workflow
   * @param data Workflow form data
   */
  setParamNCreateWorflow(data) {
    if (this.permisionList.workflow_create_edit_privilege_selector) {
      this.arrPrivilege.forEach((val) => {
        if (val.id !== '') {
          data[val.id] = val.checked;
        }
      });
    }

    data.start_date = this.startDate ? this.sharedService.formatDate(this.startDate) : null;
    data.due_date = this.dueDate ? this.sharedService.formatDate(this.dueDate) : null;
    data.workflow_tags = [];
    data.assigned_to_group = [];
    data.assigned_to_users = [];
    this.tagTitle.forEach((val) => {
      data.workflow_tags.push(val.tag);
    });
    this.groupTitle.forEach((val) => {
      data.assigned_to_group.push(val.id);
    });
    data.attachments = this.fileId;
    data.owner = this.userId;
    this.userTitle.forEach((val) => {
      data.assigned_to_users.push(val.id);
    });
    data.project = this.projectTitle && this.projectTitle.length ? this.projectTitle[0].id : null;

    if (this.workflowTemplate) {
      data.template_id = this.workflowTemplate.pk

      const customFieldsValue = {};
      this.workflowForm.value.fields.forEach(field => {
        customFieldsValue[field.pk] = field.value;
      });
      data.custom_fields_value = customFieldsValue;
    }

    this.workFlowService.createWorkflow(data).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.success.workflowCreated);
      if (res && res.workflow_id) {
        const globalFields = this.workflowForm.value.globalFields
        if (globalFields?.length) {
          const payload = []
          globalFields.forEach(field => {
            payload.push({
              global_custom_field_id: field.pk,
              value: field.value,
              object_id: res.workflow_id,
              content_type: "workflow"
            })
          });
          this.globalCustomFieldService.createCustomFieldValues(payload).subscribe(() => {
            this.router.navigate(['/main/projects/workflow', res.workflow_id]);
          })
        } else {
          this.router.navigate(['/main/projects/workflow', res.workflow_id]);
        }
      }

    });
  }

  /**
   * Upload doc if any and handle create project trigger
   */
  createProject() {
    if (!this.userTitle.length && !this.groupTitle.length) {
      return this.showErrorMessage(Messages.errors.assignOwner);
    }

    const data = this.projectForm.value;

    this.setParamNCreateProject(data);

  }

  /**
   * Set payload for creating project
   * @param data Project form data
   */
  setParamNCreateProject(data) {
    if (this.permisionList.project_create_edit_privilege_selector) {
      this.arrPrivilege.forEach((val) => {
        if (val.id !== '') {
          data[val.id] = val.checked;
        }
      });
    }

    data.start_date = this.startDate ? this.sharedService.formatDate(this.startDate) : null;
    data.due_date = this.dueDate ? this.sharedService.formatDate(this.dueDate) : null;
    data.owner = this.userId;
    data.project_tags = [];
    data.assigned_to_group = [];
    data.assigned_to_users = [];
    this.tagTitle.forEach((val) => {
      data.project_tags.push(val.tag);
    });
    this.groupTitle.forEach((val) => {
      data.assigned_to_group.push(val.id);
    });
    data.attachments = this.fileId;
    this.userTitle.forEach((val) => {
      data.assigned_to_users.push(val.id);
    });

    if (this.projectTemplate) {
      data.template_id = this.projectTemplate.pk
      const customFieldsValue = {};
      this.projectForm.value.fields.forEach(field => {
        customFieldsValue[field.pk] = field.value;
      });
      data.custom_fields_value = customFieldsValue;
    }

    this.projectService.createProject(data).subscribe((res: any) => {
      this.notifier.displaySuccessMsg(Messages.success.projectCreated);
      if (res && res.project_id) {
        const globalFields = this.projectForm.value.globalFields
        if (globalFields?.length) {
          const payload = []
          globalFields.forEach(field => {
            payload.push({
              global_custom_field_id: field.pk,
              value: field.value,
              object_id: res.project_id,
              content_type: "project"
            })
          });
          this.globalCustomFieldService.createCustomFieldValues(payload).subscribe(() => {
            this.router.navigate(['/main/projects/', res.project_id]);
          })
        } else {
          this.router.navigate(['/main/projects/', res.project_id]);
        }
      }
    });
  }

  addDocuments = (filter: string, value?: any) => {
    value.fileIds.forEach(newDoc => {
      this.fileId.push(newDoc);
    })
    value.uploadedFiles.forEach((newDoc, index) => {
      this.uploadedFile.push({
        document_name: newDoc.name,
        id: value.fileIds[index],
        document_url: newDoc.document_url
      });
    })
  }


  /**
   * Handle dropzone dropped event and validate files
   */
  dropped = (event: any) => {
    const arr = [...event.addedFiles];
    const validFiles = [];
    arr.some((file) => {
      const filename = file.name;
      const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
      if (this.sharedService.allowedFileFormats.indexOf(format) > -1) {
        validFiles.push(file);
      }
    });

    if (!validFiles.length) {
      this.uploadedFile = [];
      return this.showErrorMessage('Extensions of the allowed file types are ' + this.sharedService.allowedFileFormats.join(', '));
    }

    if (this.uploadedFile && this.uploadedFile.length) {
      validFiles.forEach(x => {
        this.uploadedFile.push(x);
      });
    } else {
      this.uploadedFile = [...validFiles];
    }
  }

  /**
   * Remove file before upload
   * @param index Document index
   */
  removeFile(index: number) {
    const temp = this.uploadedFile;
    temp.splice(index, 1);
    this.uploadedFile = [...temp];
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
}
