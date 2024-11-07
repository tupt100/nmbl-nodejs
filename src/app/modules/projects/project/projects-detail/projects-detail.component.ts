import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProjectService } from '../project.service';
import { GlobalCustomFieldService } from '../../../custom-fields/custom-field.service';
import { IWorkflow, ITask } from '../../workflow/workflow.interface';
import { WorkflowService } from '../../workflow/workflow.service';
import { TaskService } from '../../task/task.service';
import { SharedService } from 'src/app/services/sharedService';
import { AuditTrailHistoryComponent } from 'src/app/modules/shared/audit-trail-history/audit-trail-history.component';
import { Messages } from 'src/app/services/messages';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import { Location } from '@angular/common';
import * as fromRoot from '../../../../store';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-projects-detail',
  templateUrl: './projects-detail.component.html',
  styleUrls: ['./projects-detail.component.scss']
})
export class ProjectsDetailComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private store: Store<fromRoot.AppState>,
    private projectService: ProjectService,
    private router: Router,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    public sharedService: SharedService,
    private location: Location,
    private globalCustomFieldService: GlobalCustomFieldService,
  ) { }

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  @ViewChild(AuditTrailHistoryComponent) auditTrail: AuditTrailHistoryComponent;
  projectId = null;
  project: any = {};
  permisionList: any = {};
  projectSubscribe: any;
  startDate: any;
  isPrivate = false;
  importance = '';
  dueDate: any;
  arrWorkflow: Array<IWorkflow> = [];
  arrTasks: Array<ITask> = [];
  workGroupList: Array<any> = [];
  tagsList: Array<any> = [];
  usersList: Array<any> = [];
  membersList: Array<any> = [];
  arrCheckedStatus = [];
  showStatusFilter = false;
  groupTitle: any[] = [];
  tagTitle: any[] = [];
  showProjectNameEdit = false;
  projectName = '';
  showCalendar = [];
  assignedTo = [];
  privilege: any = [''];
  momentObj = moment;
  privilegeList = this.sharedService.privilegeList;
  userTitle = [];
  workFlowList = [];
  workFlowTitle = [];
  unAssignWorkFlows = [];
  public openFilter = false;
  public openMetrics = true;
  defaultParam = {
    status: '1,2,3,4,5',
    limit: 10,
    offset: 0,
    project: '',
    user: '',
    group: '',
    tag: '',
  };
  taskDefaultParams = {
    status: '1,2,3,4,5,6',
    limit: 5,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: ''
  };
  taskDefault = {
    status: '1,2,3,4,5,6',
    limit: 5,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: ''
  };
  taskTotalCount = 0;
  totalworkFlowRecords = 0;
  reverse = false;
  workflowId = 0;
  showUserAssignedFilter = false;
  showProjectMembers = false;
  showWorkflowAssignedFilter = false;
  deleteToggle = false;
  loading = false;
  tasksLoading = false;
  errorMsgSubs: any;
  isMobile = false;
  statusTitle = [];
  statusList = [];
  changeOwner = false;
  public activeTab = 'discussions';

  /**
   * @param isOpen
   * Function to check weather dropdownlist is open or not
   */
  public isDropdownOpened: boolean = false;

  /**
   * Handle mouse outside click event to close the popups, inputs, filters, calendars etc.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className !== '' &&
      typeof event.target.className !== 'object' &&
      event.target.className !== 'add-user-btn' &&
      event.target.className !== 'add-user-btn ng-star-inserted' &&
      event.target.className !== 'date-btn' &&
      !event.target.className.includes('search_input') &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'btn fbtn' &&
      event.target.className !== 'check-list' &&
      !event.target.className.includes('reNameInput') &&
      !event.target.className.includes('editCustomFieldInput') &&
      !event.target.className.includes('assignWorkflow') &&
      event.target.className !== 'btn-box text-left'
    ) {
      this.showUserAssignedFilter = false;
      this.changeOwner = false;
      this.showWorkflowAssignedFilter = false;
      this.showProjectMembers = false;
      this.showCalendar = [];
      this.showProjectNameEdit = false;
      this.deleteToggle = false;
      if (this.project && this.project.project && this.project.project.name) {
        this.projectName = this.project.project.name;
      }

      this.resetGlobalCustomFieldsShowEdit();
    }
  }

  ngOnInit() {
    // Get and check permissions for viewing project(s)
    this.projectId = this.route.snapshot.paramMap.get('id') || null;
    if (this.projectId && !isNaN(this.projectId)) {
      window.scroll(0, 0);
      this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
        if (obj.loaded) {
          if (obj.datas && obj.datas.permission) {
            this.permisionList = obj.datas.permission;
            if (
              this.permisionList.project_project_view ||
              this.permisionList.project_project_view_all
            ) {
              this.statusList = this.sharedService.pWStatusList;
              this.initAllAsyncCall();
              this.subscriptionsCalls();
            }
          }
        }
      });

      this.isMobile = this.sharedService.mainDetectMOB();
    } else {
      this.router.navigate(['/main/projects']);
    }
  }

  /**
   * Subscribing error message observable to show error message
   */
  subscriptionsCalls() {
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(msg => {
      if (msg) {
        this.notifier.displayErrorMsg(msg);
        window.scroll(0, 0);
        this.showUserAssignedFilter = false;
        this.showWorkflowAssignedFilter = false;
        this.showProjectMembers = false;
        this.showCalendar = [];
        this.showProjectNameEdit = false;
        this.deleteToggle = false;
      }
    });
  }


  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }

    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }

  /**
   * API Calls when project detail component initialize
   */
  initAllAsyncCall() {
    Promise.all([
      this.getProjectDetails(),
      this.listWorkflow(),
      this.getLists('user'),
      this.getLists('user', '', 'membersList'),
      this.getLists('group'),
      this.getLists('tag'),
      this.getLists('workflow')
    ]);
  }

  /**
   * Toggle assign workflow drop-down
   */
  openWorkflowFilter() {
    this.showWorkflowAssignedFilter = !this.showWorkflowAssignedFilter;
  }

  /**
   * Return project details
   */
  getProjectDetails() {
    const ajax = this.projectService.getProject(this.projectId).toPromise();
    ajax.then(res => {
      this.project = res;
      this.updateProjectProperties();
    }, error => {
      this.router.navigate(['/main/projects']);
    });
  }

  /**
   * Handle assignment dropdown selections
   * @param data Dropdown list
   * @param title Assignee dropdown list
   * @param groupObj Assignments array
   * @param filter Assignee dropdown type (optional special cases for tags and workflows)
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

    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      const sad = _.remove(this[title], obj => {
        if (groupObj.indexOf(obj.id) > -1) {
          return obj;
        } else {
          if (filter === 'workflow') {
            this.unAssignWorkFlows.push(obj.id);
          }
        }
      });
      this[title] = sad;
    }
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
        this.setFilterTitle('tagsList', 'tagTitle', groupObj, filterType);
        break;
      case 'workflow':
        this.setFilterTitle('workFlowList', 'workFlowTitle', groupObj, filterType);
        break;
    }
    if (filterType === 'workflow') {
      const selectedRows = this.workFlowTitle.filter(x => {
        return !this.arrWorkflow.find(y => {
          return y.workflow.id === x.id;
        });
      });
      // Assigning workflow to project
      if (selectedRows && selectedRows.length) {
        this.workflowService.updateWorkflow(
          selectedRows[0].id, { project: this.projectId }
        ).subscribe(() => {
          this.refreshPage();
        });
      }

      // Unassigning workflow from project
      if (this.unAssignWorkFlows && this.unAssignWorkFlows.length) {
        this.workflowService.updateWorkflow(this.unAssignWorkFlows[0], { project: null }).subscribe(() => {
          this.refreshPage();
        });
      }
    } else {
      this.updateProject(filterType, groupObj);
    }
  }

  /**
   * Return true if user is in project assigned users
   * @param id User ID
   */
  isAssignedUser(id): boolean {
    const idx = this.assignedTo.findIndex(x => +x.id === +id);
    return idx > -1 ? true : false;
  }

  /**
   * Update project bindings
   */
  updateProjectProperties() {
    if (!this.project) {
      return;
    }

    this.importance = this.project && this.project.project && this.project.project.importance ? this.project.project.importance : '';
    this.tagTitle = this.project && this.project.project && this.project.project.project_tags &&
      this.project.project.project_tags.length ? this.project.project.project_tags : [];
    this.projectName = this.project && this.project.project && this.project.project.name ? this.project.project.name : '';
    this.dueDate = this.project && this.project.project && this.project.project.due_date ?
      moment(this.project.project.due_date).toDate() : null;
    this.startDate = this.project && this.project.project
      && this.project.project.start_date ? moment(this.project.project.start_date).toDate() : null;
    this.isPrivate = this.project && this.project.project
      && this.project.project.is_private ? true : false;
    this.groupTitle = this.project && this.project.project &&
      this.project.project.assigned_to_group && this.project.project.assigned_to_group.length ?
      this.project.project.assigned_to_group : [];
    this.assignedTo =
      this.project && this.project.project &&
        this.project.project.assigned_to_users && this.project.project.assigned_to_users.length
        ? this.project.project.assigned_to_users : [];
    let arr: any = [];
    this.privilegeList.forEach(x => {
      if (x.id && this.project && this.project.project && this.project.project[x.id]) {
        arr.push(x);
      }
    });
    arr = arr.length ? arr : [{ id: '', title: 'None' }];
    this.privilege = [...arr];

    if (this.project && this.project.project && this.project.project.status) {
      const idx = this.sharedService.pWStatusList.findIndex(x => x.id === +this.project.project.status);
      if (idx > -1) {
        this.statusTitle = [this.sharedService.pWStatusList[idx]];
      }
    }

    this.mapCustomfields();
    this.mapGlobalCustomFields();
  }

  mapGlobalCustomFields() {
    const ajaxResult = this.globalCustomFieldService.getCustomFieldValues('project').toPromise();
    this.project.project.global_custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(res => {
      const fields = res.results.filter(i => i.object_id.toString() === this.projectId.toString())
      fields.forEach(customField => {
        this.project.project.global_custom_fields.push({
          pk: customField.pk,
          label: customField.global_custom_field.label,
          value: customField.value,
          fieldId: customField.global_custom_field.pk,
          valueToEdit: customField.value,
          controlType: getControlType(customField.global_custom_field.field_type)
        });
      });
      console.log(this.project.project.global_custom_fields);
    })
  }

  showEditForGlobalCustomField(custom_field) {
    this.resetGlobalCustomFieldsShowEdit();
    custom_field.showEdit = true;
  }

  resetGlobalCustomFieldsShowEdit() {
    if (this.project?.project?.global_custom_fields?.length) {
      this.project.project.global_custom_fields.forEach(custom_field => {
        custom_field.showEdit = false;
        custom_field.valueToEdit = custom_field.value;
      });
    }
  }

  updateGlobalCustomField(custom_field) {
    const payload = [
      {
        id: custom_field.pk,
        global_custom_field_id: custom_field.fieldId,
        value: custom_field.valueToEdit,
        object_id: this.projectId,
        content_type: "project" 
      }
    ]

    this.globalCustomFieldService.updateCustomFieldValues(payload).subscribe(resp => {
      this.refreshPage();
    });
  }

  /**
   * List project workflows
   */
  listWorkflow = (): void => {
    this.defaultParam.project = this.projectId;
    this.loading = true;
    const ajax = this.workflowService.listWorkflow(this.defaultParam).toPromise();
    ajax.then(res => {
      this.totalworkFlowRecords = res.count as number;
      if (res && res.results) {
        this.arrWorkflow = res.results.map(obj => ({ ...obj, expand: false })) as Array<IWorkflow>;
        this.arrWorkflow.map((obj: any) => {
          obj.width = this.getCompleted(obj.workflow.total_task, obj.workflow.completed_task);
        });
        const data = this.arrWorkflow.map((elem: any) => {
          return {
            id: elem.workflow.id,
            name: elem.workflow.name
          };
        });
        this.workFlowTitle = [...data];
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
    });
  }

  /**
   * Return complete percentage
   * @param totalTasks Total tasks
   * @param completedTasks Completed tasks
   */
  getCompleted(totalTasks, completedTasks): number {
    return Math.ceil((completedTasks / totalTasks) * 100);
  }

  /**
   * Refresh current route
   */
  refreshPage(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([
      '/main/projects/' +
      this.projectId
    ]);
  }

  /**
   * Return users listing
   */
  getUsers = (filteredParams: object, list?: string) => {
    const ajax = this.taskService.getUsers(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        if (list) {
          this.membersList = [...data];
        } else {
          this.usersList = [...data];
        }
      }
    });
  }

  /**
   * Return workgroups
   */
  getWorkGroups = (filteredParams) => {
    const ajax = this.taskService.getWorkGroups(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.workGroupList = res.results;
      }
    });
  }

  /**
   * Return tags
   */
  getTags = (filteredParams) => {
    const ajax = this.taskService.getTags(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.tagsList = res.results.map((elem) => {
          elem.name = elem.tag;
          return elem;
        });
      }
    });
  }

  /**
   * Return task listing for expanded workflow
   */
  getWorkflowTasks = (id: number): void => {
    this.arrWorkflow.map((obj: any) => {
      if (obj.workflow.id === id) {
        obj.expand = true;
      } else {
        obj.expand = false;
      }
    });
    this.workflowId = id;
    this.taskDefaultParams.workflow = id;
    (this.taskDefaultParams as any).assigned_to = this.taskDefaultParams.user;
    delete this.taskDefaultParams.user;
    const params: any = this.sharedService.filterParams(this.taskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    this.tasksLoading = true;
    this.workflowService.listWorkflowTasks(params).subscribe(res => {
      if (res && res.results) {
        this.taskTotalCount = res.count as number;
        this.arrTasks = res.results as Array<ITask>;
      }
      this.tasksLoading = false;
    });
  }

  /**
   * Collapse workflow
   */
  closeWorkflowTab = (workflow: IWorkflow) => {
    (workflow as any).expand = false;
    this.taskDefaultParams = Object.assign({}, this.taskDefault);
  }

  /**
   * Filter users for tasks under workflow
   * @param groupObj Users selections
   * @param filterType User filter
   */
  onAssignedUserSelected(groupObj, filterType): void {
    this.setFilterTitle('usersList', 'userTitle', groupObj);
    const userIds = this.userTitle.map(x => x.id);
    this.taskDefaultParams[filterType] = userIds.join();
    this.taskDefaultParams.offset = 0;
    this.getWorkflowTasks(this.workflowId);
    this.showUserAssignedFilter = false;
  }

  /**
   * Trigger when user click ALL option of filter
   * @param filter Filter type
   * @param filterSelection Filter list
   * @param filterTitle Filter selection
   */
  clearSelections(filter, filterSelection, filterTitle): void {
    this[filterSelection] = this[filterTitle] = [];
    this.getLists(filter);
    this.taskDefaultParams[filter] = '';
    this.taskDefaultParams.offset = 0;
    this.getWorkflowTasks(this.workflowId);
    this.showUserAssignedFilter = false;
  }

  /**
   * Pagination control for listing
   */
  loadMoreData = (offset: number): void => {
    this.defaultParam.offset = offset;
    this.listWorkflow();
  }

  /**
   * Sorting handler
   * @param orderBy ordering Key
   */
  orderByChange(orderBy: string): void {
    if (this.taskDefaultParams.ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this.taskDefaultParams.ordering = orderBy;
    }
    this.getWorkflowTasks(this.workflowId);
  }

  /**
   * Return listing for assignee dropdowns
   */
  getLists = (filter: string, search?: any, list?: string) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 100
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        this.getUsers(filteredParams, list);
        break;
      case 'group':
        this.getWorkGroups(filteredParams);
        break;
      case 'tag':
        if (search && search.keyCode === 13) {
          delete filteredParams.search;
        }
        this.getTags(filteredParams);
        break;
      case 'workflow':
        this.getWorkFlows(filteredParams);
        break;
    }
  }

  /**
   * Return workflows
   */
  getWorkFlows = (filteredParams) => {
    filteredParams.status = 1;
    const ajax = this.taskService.getWorkFlows(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setWorkFlows(res);
      }
    });
  }

  /**
   * Modify workflow response
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
  }

  /**
   * Handle status filter
   * @param status Task status(s)
   */
  selectTaskStatus(status: number[]) {
    this.arrCheckedStatus = status;
    this.taskDefaultParams.status = status && status.length ? status.join() : '1,2,3,4,5,6';
    this.taskDefaultParams.offset = 0;
    this.getWorkflowTasks(this.workflowId);
    this.showStatusFilter = false;
  }

  /**
   * Open one dropdown at one time
   * @param filter1 Any dropdown
   * @param filter2 Any dropdown
   */
  handleFilterShow(filter1, filter2): void {
    this[filter1] = !this[filter1];
    this[filter2] = false;
  }

  /**
   * Navigate to workflow detail page
   */
  workflowDetail = (id: number) => {
    this.router.navigate(['main/projects/workflow', id]);
  }


  /**
   * Handler for updating project details
   */
  updateProject = (filter: string, value?: any) => {
    this.isDropdownOpened = false;
    const body: any = {};
    switch (filter) {
      case 'group':
        body.assigned_to_group = value;
        break;

      case 'tag':
        const tagNames = this.tagTitle && this.tagTitle.length ? this.tagTitle.map(x => x.tag) : [];
        body.project_tags = tagNames;
        break;

      case 'privilege':
        value.map((x: any) => {
          if (x.id) {
            body[x.id] = x.checked;
          }
        });
        break;

      case 'importance':
        this.importance = value;
        body.importance = value;
        break;

      case 'dueDate':
        if (
          !this.project || !this.dueDate ||
          this.dueDate && this.project && this.project.project &&
          this.project.project.due_date && moment(this.project.project.due_date).isSame(moment(this.dueDate))
        ) {
          return;
        }
        body.due_date = this.sharedService.formatDate(this.dueDate);
        break;

      case 'startDate':
        if (
          !this.project || !this.startDate ||
          this.startDate && this.project && this.project.project &&
          this.project.project.start_date && moment(this.project.project.start_date).isSame(moment(this.startDate))
        ) {
          return;
        }
        body.start_date = this.sharedService.formatDate(this.startDate);
        break;

      case 'private':
        body.is_private = this.isPrivate;
        break;

      case 'documents':
        body.attachments = value.fileIds;
        break;

      case 'status':
        body.status = value;
        break;

      case 'assignToUsers':
        body.assigned_to_users = value;
        break;
    }
    this.projectService.updateProject(this.projectId, body).subscribe(resp => {
      if (resp && Object.keys(resp).length && this.project && this.project.project) {
        this.project.project = resp;
      }
      this.updateProjectProperties();
      this.auditTrail.listAuditTrail();
      this.hidePopups();
    }, (error) => {
      this.updateProjectProperties();
      this.hidePopups();
    });
  }

  /**
   * Hide popups/dropdowns
   */
  hidePopups(): void {
    this.showUserAssignedFilter = false;
    this.showProjectMembers = false;
    this.showCalendar = [];
  }

  /**
   * Show input for renaming project
   */
  showProjectNameInput() {
    this.showProjectNameEdit = true;
  }

  /**
   * Handler for renaming project
   */
  renameProjectTitle() {
    if (!this.permisionList.project_project_edit_name) {
      this.showProjectNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.permissionErr);
    }

    if (!this.projectName || this.projectName.trim() === '') {
      this.showProjectNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.projectNameRequired);
    }

    if (this.projectName && this.projectName.length > 254) {
      this.showProjectNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.projectNameLength);
    }
    this.projectService.renameProjectTitle(this.projectId, { name: this.projectName }).subscribe(() => {
      this.refreshPage();
    }, error => {
      this.updateProjectProperties();
      this.hidePopups();
    });
  }

  /**
   * Update assigned users in project
   * @param event Checkbox change event
   * @param item User
   */
  changeAssignUser(event, item) {
    const checked = event.target.checked;
    const arr = this.project.project.assigned_to_users;

    if (arr && arr.length) {
      const ids = arr.map(x => x.id);
      if (checked) {
        ids.push(item.id);
      } else {
        const idx = arr.findIndex(x => x.id === item.id);
        if (idx > -1) {
          ids.splice(idx, 1);
        }
      }
      this.updateProject('assignToUsers', ids);
    } else {
      if (checked) {
        this.updateProject('assignToUsers', [item.id]);
      }
    }
  }

  mapCustomfields() {
    const templateId = this.project.project.template_id;
    if (!templateId) return;
    const customFieldsValue = this.project.project.custom_fields_value;
    const ajaxResult = this.projectService.getProjectTemplate(templateId.toString()).toPromise();
    this.project.custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(template => {
      Object.keys(customFieldsValue).forEach(key => {
        const customField = template.custom_fields.find(a => a.pk === parseInt(key));
        this.project.custom_fields.push({
          pk: customField.pk,
          label: customField.label,
          value: customFieldsValue[key],
          valueToEdit: customFieldsValue[key],
          controlType: getControlType(customField.field_type)
        });
      });
    })
  }

  updateCustomField() {
    const body: any = {};

    body.custom_fields_value = {
    };

    this.project.custom_fields.forEach(customField => {
      body.custom_fields_value[customField.pk] = customField.valueToEdit;
    });

    this.projectService.updateProject(this.projectId, body).subscribe(resp => {
      this.refreshPage();
    });
  }

  /**
   * Navigate to create workflow with prefilled project
   */
  goToCreateWorkflow(): void {
    const data = [{
      id: this.project.project.id,
      name: this.project.project.name
    }];
    this.sharedService.moduleCarrier.next({ type: 'project', data });
    this.router.navigate(['/main/projects/create/workflow']);
  }

  /**
   * Back link handler
   */
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/main/projects']);
    }
  }

  /**
   * @param item
   * Functon to change project owner
   */
  changeProjectOwner(item) {
    this.projectService.updateProject(this.projectId, { owner: item.id }).subscribe(res => {
      if (res) {
        this.project.project = res;
        this.updateProjectProperties();
        this.auditTrail.listAuditTrail();
      }
      this.changeOwner = false;
    }, error => {
      this.changeOwner = false;
      this.updateProjectProperties();
    });
  }
  isOpened = (isOpen: boolean) => {
    this.isDropdownOpened = isOpen;
  }

  /**
   * @param isSuccess
   * Function to display success message if copied to clipboard
   */
  onSuccess = (isSuccess) => {
    if (isSuccess) {
      this.notifier.displaySuccessMsg('Copied to clipboard!');
    } else {
      this.notifier.displayErrorMsg('Error occured while copy to clipboard!');
    }
  }
}
