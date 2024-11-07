import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../workflow.service';
import { TaskService } from '../../task/task.service';
import { GlobalCustomFieldService } from '../../../custom-fields/custom-field.service';
import { SharedService } from '../../../../services/sharedService';
import { IWorkflow, ITask, IAssignedTo } from '../workflow.interface';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';
import { ProjectService } from 'src/app/modules/projects/project/project.service';
import { AuditTrailHistoryComponent } from 'src/app/modules/shared/audit-trail-history/audit-trail-history.component';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import * as moment from 'moment';
import * as fromRoot from '../../../../store';
import * as _ from 'lodash';
declare const google: any;

@Component({
  selector: 'app-workflow-edit',
  templateUrl: './workflow-edit.component.html',
  styleUrls: ['./workflow-edit.component.scss']
})
export class WorkflowEditComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>,
    private router: Router,
    private location: Location,
    private projectService: ProjectService,
    private globalCustomFieldService: GlobalCustomFieldService,
  ) { }
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  @ViewChild(AuditTrailHistoryComponent) auditTrail: AuditTrailHistoryComponent;
  public chartProperties = [];
  public chartProperties1 = [];
  public workflowId = 0;
  public taskTotalCount = 0;
  public arrTasks: Array<ITask> = [];
  public tagsList: Array<any> = [];
  public workGroupList: Array<any> = [];
  public projectsList: Array<any> = [];
  public projectTitle: Array<any> = [];
  public previousProject: any;
  public groupTitle = [];
  public tagTitle = [];
  public privilegeTitle = [];
  public workflow: IWorkflow;
  public arrCheckedStatus = [1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34];
  public showUserAssignedFilter = false;
  public showStatusFilter = false;
  public userTitle = [];
  public taskUserTitle = [];
  public usersList: Array<any> = [];
  public taskUsersList: Array<any> = [];
  public reverse = false;
  public assignedTo: Array<IAssignedTo> = [];
  public assignedUser = false;
  public showWorkFlowNameEdit = false;
  public assignToUser: IAssignedTo;
  public openFilter = false;
  public openMetrics = true;
  workFlowName = '';
  projectSubscribe: any;
  public taskDefaultParams = {
    status: '1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34',
    limit: 10,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: '',
    assigned_to: ''
  };
  public headerDetails = {
    completedTasks: 0,
    dueTasks: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    overdueTasks: 0,
    totalTasks: 0,
    totalWorkflow: 0,
    notCompletedTasks: 0
  };
  public privilege: any = [''];
  public privilegeList = this.sharedService.privilegeList;
  public dueDate: any;
  public startDate: any;
  public momentObj = moment;
  public isShowDue = false;
  public isShowStart = false;
  public permisionList: any = {};
  public showCalendar = [];
  public isGanttView = false;
  public isPrivate = false;
  public status = '';
  public importance = '';
  loading = false;
  deleteToggle = false;
  errorMsgSubs: any;
  public activeTab = 'discussions';
  isMobile = false;
  statusList = [];
  statusTitle = [];
  changeOwner = false;
  public deleteObj = {
    action: '',
    message1: '',
    message2: '',
    buttonText: 'Delete',
    docToDelete: null
  };
  public showModal = {
    deleteDoc: false,
  };

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
      event.target.className !== 'sm-span' &&
      !event.target.className.includes('add-user-btn') &&
      event.target.className !== 'date-btn' &&
      event.target.className !== 'search_input' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'btn fbtn' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'search_input ng-pristine ng-valid ng-touched' &&
      event.target.className !== 'check-list' &&
      !event.target.className.includes('reNameInput') &&
      !event.target.className.includes('editCustomFieldInput') &&
      event.target.className !== 'btn-box text-left'
    ) {
      this.showUserAssignedFilter = false;
      this.showCalendar = [];
      this.assignedUser = false;
      this.changeOwner = false;
      this.showWorkFlowNameEdit = false;
      this.deleteToggle = false;
      if (this.workflow && this.workflow.workflow && this.workflow.workflow.name) {
        this.workFlowName = this.workflow.workflow.name;
      }

      this.resetGlobalCustomFieldsShowEdit();
    }
  }

  ngOnInit() {
    // Get and check permissions for viewing workflow(s)
    this.workflowId = this.activatedRoute.snapshot.params.id;
    if (this.workflowId) {
      this.taskDefaultParams.workflow = this.workflowId;
      this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
        if (obj.loaded) {
          if (obj.datas && obj.datas.permission) {
            this.permisionList = obj.datas.permission;
            if (
              this.permisionList.workflow_workflow_view || this.permisionList.workflow_workflow_view_all
            ) {
              this.statusList = this.sharedService.pWStatusList;
              this.initAsyncCall();
              this.subscriptionsCalls();
            }
          }
        }
      });

      this.isMobile = this.sharedService.mainDetectMOB();
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
        this.showCalendar = [];
        this.assignedUser = false;
        this.showWorkFlowNameEdit = false;
        this.deleteToggle = false;
      }
    });
  }

  /**
   * API Calls when workflow edit component initialize
   */
  initAsyncCall() {
    Promise.all([
      this.getWorkflowById(),
      this.getWorkflowStatistics(),
      this.listTaskOfWorkflow(),
      this.getLists('user', 'both'),
      this.getLists('group'),
      this.getLists('tag'),
      this.getLists('projects')
    ]);
  }

  /**
   * Return workflow details
   */
  getWorkflowById = () => {
    this.workflowService.getWorkflowById(this.workflowId).subscribe(res => {
      if (res) {
        this.workflow = res as IWorkflow;
        this.updateWorkflowProperties();
        this.getWorkflowProjectStats();
      }
    }, (error) => {
      this.router.navigate(['/main/projects/list-workflow']);
    });
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStatistics = (): void => {
    this.workflowService.getWorkflowStatisticsById(this.workflowId).subscribe(res => {
      if (res) {
        this.headerDetails = {
          completedTasks: res.completed_task || 0,
          dueTasks: res.due_today || 0,
          highPriority: res.high || 0,
          mediumPriority: res.med || 0,
          lowPriority: res.low || 0,
          overdueTasks: res.total_due || 0,
          totalTasks: res.all_task || 0,
          totalWorkflow: res.total_workflow || 0,
          notCompletedTasks: res.all_task - res.completed_task
        };
        this.showPieChart();
        this.showPieChart1();
      }
    });
  }

  /**
   * Return workflow project details
   */
  getWorkflowProjectStats() {
    this.workflowService.workflowProjecStats(this.workflowId).subscribe(res => {
      this.workflow.project = res && res.project && this.workflow ? res.project : '';
      this.setProjectTitle();
    });
  }

  /**
   * Show Pie chart  for completed, incompleted and overdue tasks.
   */
  showPieChart(): void {
    const arr = [
      {
        backgroundColor: ['#485CC7', '#D4D8F2', '#F73B22'],
        labels: ['Completed', 'Incompleted', 'Overdue'],
        data: [this.headerDetails.completedTasks, this.headerDetails.notCompletedTasks, this.headerDetails.overdueTasks],
        id: 'chart1',
        isTooltip: true
      },
    ];
    this.chartProperties = [...arr];
  }

  /**
   * Show Pie chart  for high, medium and low priority projects.
   */
  showPieChart1(): void {
    const arr = [
      {
        backgroundColor: ['#f73b22', '#f9cd07', '#33c12e'],
        labels: ['High', 'Medium', 'Low'],
        data: [this.headerDetails.highPriority, this.headerDetails.mediumPriority, this.headerDetails.lowPriority],
        id: 'chart2',
        isTooltip: true
      }
    ];
    this.chartProperties1 = [...arr];
  }

  /**
   * Return complete percentage
   */
  completePercent(): number {
    if (this.headerDetails && Object.keys(this.headerDetails).length && this.headerDetails.hasOwnProperty('completedTasks')) {
      const percent = !this.headerDetails.completedTasks ? 0
        : Math.ceil((this.headerDetails.completedTasks / this.headerDetails.totalTasks) * 100);
      return percent;
    }
  }

  /**
   * Return tasks for workflows
   */
  listTaskOfWorkflow = () => {
    if (this.taskDefaultParams && this.taskDefaultParams.user) {
      this.taskDefaultParams.assigned_to = this.taskDefaultParams.user;
      delete this.taskDefaultParams.user;
    } else {
      delete this.taskDefaultParams.assigned_to;
    }

    const params = Object.assign({}, this.taskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;

    const filterParams = this.sharedService.filterParams(params);
    this.loading = true;
    this.workflowService.listWorkflowTasks(filterParams).subscribe(res => {
      if (res && res.results) {
        this.taskTotalCount = res.count as number;
        this.arrTasks = res.results as Array<ITask>;
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
    });
  }

  /**
   * Pagination control for tasks listing
   */
  loadMoreTaskOfWorkflow = (offset: number) => {
    this.taskDefaultParams.offset = offset;
    this.listTaskOfWorkflow();
  }

  /**
   * Return listing for assignee dropdowns
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 100
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        this.getUsers(filteredParams, search);
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
      case 'taskuser':
        this.getUsers(filteredParams, true);
      case 'projects':
        this.getProjects(filteredParams);
        break;
    }
  }

  /**
   * Get users listing
   */
  getUsers = (filteredParams, task?: boolean | string) => {
    this.taskService.getUsers(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });

        if (task === 'both') {
          this.taskUsersList = JSON.parse(JSON.stringify(data));
          this.usersList = JSON.parse(JSON.stringify(data));
        } else {
          const key = task === true ? 'taskUsersList' : 'usersList';
          this[key] = data;
        }
      }
    });
  }

  /**
   * Get workgroups listing
   */
  getWorkGroups = (filteredParams) => {
    this.taskService.getWorkGroups(filteredParams).subscribe(res => {
      if (res) {
        this.workGroupList = res.results;
      }
    });
  }

  /**
   * Get tags listing
   */
  getTags = (filteredParams) => {
    this.taskService.getTags(filteredParams).subscribe(res => {
      if (res) {
        this.tagsList = res.results.map((elem) => {
          elem.name = elem.tag;
          return elem;
        });
      }
    });
  }

  /**
   * Handle workflow tasks assign to filter changes
   * @param groupObj Selected users
   */
  onTaskFilterSelected(groupObj): void {
    this.setFilterTitle('taskUsersList', 'taskUserTitle', groupObj);
    this.taskDefaultParams.user = (groupObj && groupObj.length) ? this.setDefaultFilterVal(groupObj, 'user') : '';
    this.taskDefaultParams.offset = 0;
    this.listTaskOfWorkflow();
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
      case 'projects':
        this.previousProject = [...this.projectTitle];
        if (this.projectTitle && this.projectTitle.length) {
          this.onSingleFilterSelected('projectsList', 'projectTitle', groupObj);
        }
        this.setFilterTitle('projectsList', 'projectTitle', groupObj);
        return this.openReassignPopup('reAssignProject', null);
    }
    this.updateWorkflow(filterType, groupObj);
  }

  /**
   * Set filter in Listing API params
   * @param groupObj Selected filters list
   * @param filterType Filter type
   */
  setDefaultFilterVal(groupObj, filterType) {
    return this.taskDefaultParams[filterType] = groupObj.join();
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

    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filter, filterSelection, filterTitle): void {
    this[filterSelection] = this[filterTitle] = [];
    this.taskDefaultParams[filter] = '';
    delete this.taskDefaultParams.assigned_to;
    this.getLists(filter);
    this.listTaskOfWorkflow();
  }

  /**
   * Handler for ordering tasks
   * @param orderBy Ordering key
   */
  orderByChange(orderBy: string): void {
    if (this.taskDefaultParams.ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this.taskDefaultParams.ordering = orderBy;
    }
    this.listTaskOfWorkflow();
  }

  /**
   * Display one filter dropdown at a time
   * @param filter1 Any filter dropdown
   * @param filter2 Any filter dropdown
   */
  handleFilterShow(filter1, filter2): void {
    this[filter1] = !this[filter1];
    this[filter2] = false;
  }

  /**
   * Handler to filter tasks by status(s)
   * @param status Selected status from filter
   */
  selectTaskStatus(status: number[]) {
    this.arrCheckedStatus = status;
    this.taskDefaultParams.status = status && status.length ? status.join() : '1,2,3,4,5,6';
    this.taskDefaultParams.offset = 0;
    this.listTaskOfWorkflow();
    this.showStatusFilter = false;
  }

  /**
   * Checked if user is an assigned member
   */
  isUserAssigned = (id) => {
    const data = this.assignedTo.filter(x => x.id === id);
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handler for changing assigned member
   * @param event Checkbox change event
   * @param item User
   */
  changeAssignUser(event, item) {
    const checked = event.target.checked;
    const arr = this.workflow.workflow.assigned_to_users;

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
      this.updateWorkflow('assignToUsers', ids);
    } else {
      if (checked) {
        this.updateWorkflow('assignToUsers', [item.id]);
      }
    }
  }

  /**
   * Handler for updating workflow details
   * @param filter Workflow assingment key
   * @param value Workflow assingment value (optional)
   */
  updateWorkflow = (filter: string, value?: any) => {
    this.isDropdownOpened = false;
    const body: any = {};
    switch (filter) {
      case 'group':
        body.assigned_to_group = value;
        break;

      case 'tag':
        const tagNames = this.tagTitle && this.tagTitle.length ? this.tagTitle.map(x => x.tag) : [];
        body.workflow_tags = tagNames;
        break;

      case 'privilege':
        value.map((x: any) => {
          if (x.id) {
            body[x.id] = x.checked;
          }
        });
        break;

      case 'status':
        this.status = value;
        body.status = this.status;
        break;

      case 'private':
        body.is_private = this.isPrivate;
        break;

      case 'importance':
        this.importance = value;
        body.importance = value;
        break;

      case 'startDate':
        if (
          !this.workflow || !this.startDate ||
          this.startDate && this.workflow && this.workflow.workflow &&
          this.workflow.workflow.start_date && moment(this.workflow.workflow.start_date).isSame(moment(this.startDate))
        ) {
          return;
        }
        body.start_date = this.sharedService.formatDate(this.startDate);
        break;

      case 'dueDate':
        if (
          !this.workflow || !this.dueDate ||
          this.dueDate && this.workflow && this.workflow.workflow &&
          this.workflow.workflow.due_date && moment(this.workflow.workflow.due_date).isSame(moment(this.dueDate))
        ) {
          return;
        }
        body.due_date = this.sharedService.formatDate(this.dueDate);
        break;

      case 'documents':
        body.attachments = value.fileIds;
        break;

      case 'user':
        body.assigned_to = value;
        break;

      case 'assignToUsers':
        body.assigned_to_users = value;
        break;
      case 'reAssignProject':
        body.project = value;
        break;
    }

    this.workflowService.updateWorkflow(this.workflowId, body).subscribe(() => {
      this.getWorkflowById();
      this.showUserAssignedFilter = false;
      this.showCalendar = [];
      this.assignedUser = false;
      this.showWorkFlowNameEdit = false;
      this.updateTrails();
      this.handleConfirmationResponse();
    }, (error) => {
      this.updateWorkflowProperties();
      this.showUserAssignedFilter = false;
      this.showCalendar = [];
      this.assignedUser = false;
      this.showWorkFlowNameEdit = false;
      this.handleConfirmationResponse();
    });
  }

  /**
   * Refresh current route
   */
  refreshPage(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([
      '/main/projects/workflow/' +
      this.workflowId
    ]);
  }

  /**
   * Call audit trail component function for history lisitng
   */
  updateTrails(): void {
    this.auditTrail.listAuditTrail();
  }

  /**
   * Toggle gantt chart view and table view
   */
  changeView = (isChecked) => {
    if (isChecked) {
      google.charts.load('current', { packages: ['gantt'] });
      google.charts.setOnLoadCallback(this.drawChart);
      this.isGanttView = true;
    } else {
      this.isGanttView = false;
    }
  }

  /**
   * Render Gantt chart
   */
  drawChart = () => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Name');
    data.addColumn('string', 'Resource');
    data.addColumn('date', 'Start');
    data.addColumn('date', 'End');
    data.addColumn('number', 'Duration');
    data.addColumn('number', 'Percent Complete');
    data.addColumn('string', 'Dependencies');
    if (this.arrTasks && this.arrTasks.length > 0) {
      let tempData: Array<ITask> = [];
      this.arrTasks.map(obj => {
        const taskId = obj.task.id;
        const taskName = obj.task.name || '';
        const resource = obj.task && obj.task.assigned_to ? `${obj.task.assigned_to.first_name} ${obj.task.assigned_to.last_name}` : '';
        const percentComplete = obj.task.completed_percentage ? obj.task.completed_percentage : 0;
        let dependancy = null;
        if (obj.task.prior_task) {
          const ob = this.arrTasks.filter(x =>
            +x.task.id === +obj.task.prior_task && +x.task.id !== +obj.task.id
          );
          if (ob && ob.length > 1) {
            dependancy = obj.task.prior_task;
          } else {
            dependancy = null;
          }
        }

        let start: Date = null;
        let end: Date = null;
        if (obj.task.start_date) {
          start = new Date(moment(obj.task.start_date).format('YYYY,MM,DD'));
        } else {
          start = new Date(moment(obj.task.created_at).format('YYYY,MM,DD'));
        }

        if (obj.task.due_date) {
          end = obj.task.due_date ? new Date(moment(obj.task.due_date).format('YYYY,MM,DD')) : new Date(moment().format('YYYY,MM,DD'));
        } else {
          end = new Date(moment().format('YYYY,MM,DD'));
        }

        data.addRows([
          [`${taskId}`, `${taskName}`, `${resource}`, start, end, null, percentComplete, dependancy],
        ]);
      });
      const options = {
        height: 270,
        legend: { position: 'top', maxLines: 5 },
        bar: { groupWidth: '50%' },
        tooltip: {
          trigger: 'none',
          isHtml: false
        },
        gantt: {
          palette: [],
          barHeight: 2,
          barCornerRadius: 4,
          shadowEnabled: false,
          criticalPathEnabled: true,
          trackHeight: 30,
          criticalPathStyle: {
            stroke: '#e64a19',
            strokeWidth: 1
          },
          innerGridTrack: {
            fill: '#ffffff',
            strokeWidth: 0
          },
          innerGridDarkTrack: {
            fill: '#f8f8fd',
            strokeWidth: 0
          },
          arrow: {
            angle: 100,
            width: 1,
            strokeWidth: 1,
            radius: 0
          },
          rowlabelStyle: { fontName: 'stolzl regular', fontSize: 11, color: '#151B3B' },
          labelStyle: { fontName: 'stolzl regular', fontSize: 11 },
          showRowLabels: true,
          avoidOverlappingGridLines: true
        },
      };
      setTimeout(() => {
        const container = document.getElementById('chart_div');
        const containerBounds = container.getBoundingClientRect();
        const chart = new google.visualization.Gantt(container);
        google.visualization.events.addOneTimeListener(chart, 'ready', () => {
          const rectangles = container.getElementsByTagName('path');
          for (let i = 0; i < rectangles.length; i++) {
            if (rectangles[i].getAttribute('x') !== '0') {
              const color = rectangles[i].getAttribute('fill');
              const barLabel = container.appendChild(document.createElement('span'));
              if ((tempData[i] as any).displayType === 'due') {
                barLabel.innerHTML = `OVERDUE BY ${(tempData[i] as any).dueBy} DAYS`;
              } else if ((tempData[i] as any).displayType === 'per') {
                barLabel.innerHTML = tempData[i].task.completed_percentage.toString() + '%';
              } else if ((tempData[i] as any).displayType === 'date') {
                barLabel.innerHTML = tempData[i].task.due_date
                  ? moment(tempData[i].task.due_date).format('MM/DD/YYYY')
                  : (tempData[i].task.start_date
                    ? moment(tempData[i].task.start_date).format('MM/DD/YYYY')
                    : tempData[i].task.completed_percentage.toString() + '%');
              }
              barLabel.style.background = color;
              barLabel.style.color = '#FFFFFF';
              barLabel.style.textAlign = 'center';
              barLabel.style.position = 'absolute';
              barLabel.style.overflow = 'hidden';
              barLabel.style.fontSize = '10px';
              barLabel.style.padding = '1px 5px';
              barLabel.style.borderRadius = '3px';
              if ((tempData[i] as any).displayType === 'due') {
                barLabel.style.width = 'auto';
              } else if ((tempData[i] as any).displayType === 'per') {
                barLabel.style.width = '45px';
              } else if ((tempData[i] as any).displayType === 'date') {
                barLabel.style.width = '80px';
              }
              barLabel.style.top = container.offsetTop + (rectangles[i].getBBox().y - 7) + 'px';
              barLabel.style.left = rectangles[i].getBBox().x + rectangles[i].getBBox().width + containerBounds.left + 'px';
            }
          }
        });

        google.visualization.events.addListener(chart, 'select', () => {
          const obj = chart.getSelection();
          this.redirectToDetail(obj[0].row);
        });

        tempData = this.arrTasks.sort((a, b) => {
          const adat = moment(a.task.start_date).format('YYYYMMDD');
          const bdate = moment(b.task.start_date).format('YYYYMMDD');
          let rv = +adat - +bdate;
          if (rv === 0) {
            rv = a.task.name.localeCompare(b.task.name);
          }
          return rv;
        });

        const adate = moment(tempData[0].task.start_date).format('YYYYMMDD');
        tempData.map((b: any) => {
          const today = moment().format('YYYYMMDD');
          let due;
          if (b.task.due_date) {
            due = moment(b.task.due_date).format('YYYYMMDD');
          } else if (b.task.start_date) {
            due = moment(b.task.start_date).format('YYYYMMDD');
          } else {
            due = moment(new Date()).format('YYYYMMDD');
          }
          const bdate = moment(b.task.start_date).format('YYYYMMDD');
          const rv = +adate - +bdate;
          let obj;
          if (due < today) {
            const days = +today - +due;
            b.displayType = 'due';
            b.dueBy = days;
            obj = {
              color: '#f73b22',
              dark: '#f73b22',
              light: '#f73b22'
            };
          } else if (rv === 0 || isNaN(rv)) {
            b.displayType = 'per';
            b.dueBy = 0;
            obj = {
              color: '#485cc7',
              dark: '#485cc7',
              light: '#485cc7'
            };
          } else {
            b.displayType = 'date';
            b.dueBy = 0;
            obj = {
              color: '#33c12e',
              dark: '#33c12e',
              light: '#33c12e'
            };
          }
          options.gantt.palette.push(obj);
        });
        chart.draw(data, options);
        google.visualization.events.addListener(chart, 'onmouseover', () => {
          const xyz = container.getElementsByTagName('rect');
          for (let i = 0; i <= xyz.length; i++) {
            if (xyz[i] && xyz[i].hasAttribute('filter')) {
              const size = xyz[i].getAttribute('rx');
              if (size === '2') {
                const rect = xyz[i];
                rect.closest('g').style.display = 'none';
              }
            }
          }
        });
      }, 500);
    }
  }

  /**
   * Navigate to task detail
   */
  redirectToDetail = (index: number) => {
    const data = this.arrTasks[index];
    if (data) {
      this.router.navigate(['main/projects/tasks/', data.task.id]);
    }
  }

  /**
   * Handler for renaming workflow
   */
  reNameFlowTitle() {
    if (!this.permisionList.workflow_workflow_edit_name) {
      this.showWorkFlowNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.permissionErr);
    }

    if (!this.workFlowName || this.workFlowName.trim() === '') {
      this.showWorkFlowNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.workFlowNameRequired);
    }

    if (this.workFlowName && this.workFlowName.length > 254) {
      this.showWorkFlowNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.workFlowNameLength);
    }

    this.workflowService.reNameWorkflowTitle(this.workflowId, { name: this.workFlowName }).subscribe(() => {
      this.refreshPage();
    }, error => {
      this.updateWorkflowProperties();
    });
  }

  /**
   * Show input for renaming task
   */
  showWorkFlowNameInput() {
    this.showWorkFlowNameEdit = true;
  }

  /**
   * Update workflow bindings
   */
  updateWorkflowProperties() {
    if (!this.workflow) {
      return;
    }

    this.workFlowName = this.workflow && this.workflow.workflow && this.workflow.workflow.name ? this.workflow.workflow.name : '';
    this.groupTitle = this.workflow && this.workflow.workflow && this.workflow.workflow.assigned_to_group &&
      this.workflow.workflow.assigned_to_group.length ? this.workflow.workflow.assigned_to_group : [];
    this.assignedTo = (this.workflow && this.workflow.workflow && this.workflow.workflow.assigned_to_users) ?
      this.workflow.workflow.assigned_to_users : null;
    this.tagTitle = this.workflow && this.workflow.workflow && this.workflow.workflow.workflow_tags
      && this.workflow.workflow.workflow_tags.length ? this.workflow.workflow.workflow_tags : [];
    this.dueDate = this.workflow &&
      this.workflow.workflow && this.workflow.workflow.due_date ? moment(this.workflow.workflow.due_date).toDate() : null;
    this.startDate = this.workflow &&
      this.workflow.workflow && this.workflow.workflow.start_date ? moment(this.workflow.workflow.start_date).toDate() : null;
    let arr: any = [];
    this.privilege = [];
    this.privilegeList.forEach(x => {
      if (x.id && this.workflow && this.workflow.workflow && this.workflow.workflow[x.id]) {
        arr.push(x);
      }
    });
    arr = arr.length ? arr : [{ id: '', title: 'None' }];
    this.privilege = [...arr];
    this.status = this.workflow && this.workflow.workflow && this.workflow.workflow.status ? this.workflow.workflow.status : '';
    this.isPrivate = this.workflow && this.workflow.workflow && this.workflow.workflow.is_private ? true : false;
    this.importance = this.workflow && this.workflow.workflow && this.workflow.workflow.importance ? this.workflow.workflow.importance : '';

    if (this.workflow && this.workflow.workflow && this.workflow.workflow.status) {
      const idx = this.sharedService.pWStatusList.findIndex(x => x.id === +this.workflow.workflow.status);
      if (idx > -1) {
        this.statusTitle = [this.sharedService.pWStatusList[idx]];
      }
    }
    this.mapCustomfields();
    this.mapGlobalCustomFields();
  }

  mapGlobalCustomFields() {
    const ajaxResult = this.globalCustomFieldService.getCustomFieldValues('workflow').toPromise();
    this.workflow.workflow.global_custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(res => {
      const fields = res.results.filter(i => i.object_id.toString() === this.workflowId.toString())
      fields.forEach(customField => {
        this.workflow.workflow.global_custom_fields.push({
          pk: customField.pk,
          label: customField.global_custom_field.label,
          value: customField.value,
          fieldId: customField.global_custom_field.pk,
          valueToEdit: customField.value,
          controlType: getControlType(customField.global_custom_field.field_type)
        });
      });
    })
  }

  showEditForGlobalCustomField(custom_field) {
    this.resetGlobalCustomFieldsShowEdit();
    custom_field.showEdit = true;
  }

  resetGlobalCustomFieldsShowEdit() {
    if (this.workflow?.workflow?.global_custom_fields?.length) {
      this.workflow.workflow.global_custom_fields.forEach(custom_field => {
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
        object_id: this.workflowId,
        content_type: "workflow" 
      }
    ]

    this.globalCustomFieldService.updateCustomFieldValues(payload).subscribe(resp => {
      this.refreshPage();
    });
  }

  mapCustomfields() {
    const templateId = this.workflow.workflow.template_id;
    if (!templateId) return;
    const customFieldsValue = this.workflow.workflow.custom_fields_value;
    const ajaxResult = this.workflowService.getWorkflowTemplate(templateId.toString()).toPromise();
    this.workflow.custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(template => {
      Object.keys(customFieldsValue).forEach(key => {
        const customField = template.custom_fields.find(a => a.pk === parseInt(key));
        this.workflow.custom_fields.push({
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

    this.workflow.custom_fields.forEach(customField => {
      body.custom_fields_value[customField.pk] = customField.valueToEdit;
    });

    this.workflowService.updateWorkflow(this.workflowId, body).subscribe(resp => {
      this.refreshPage();
    });
  }

  /**
   * Navigate to create task with selected workflow
   */
  goToCreateTask(): void {
    const data = [{
      id: this.workflow.workflow.id,
      name: this.workflow.workflow.name
    }];
    this.sharedService.moduleCarrier.next({ type: 'workflow', data });
    this.router.navigate(['/main/projects/create/task']);
  }

  /**
   * Send ping notification to task
   * @param id Task ID
   */
  sendTaskNotification(id) {
    this.sharedService.sendNotifications(id).subscribe(() => {
      this.notifier.displaySuccessMsg(Messages.success.task.notification);
    });
  }

  /**
   * Mark task as completed
   * @param id task ID
   */
  markTaskAsComplete(id) {
    const data = {
      status: 3
    };
    this.taskService.updateTask(id, data).subscribe(res => {
      this.refreshPage();
    }, error => {
      this.updateWorkflowProperties();
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
   * Use window history so that back link act as browser back button
   */
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/main/projects/list-workflow']);
    }
  }

  /**
   * @param item
   * Functon to change workflow owner
   */
  changeWorkflowOwner(item) {
    this.workflowService.updateWorkflow(this.workflowId, { owner: item.id }).subscribe(res => {
      if (res) {
        this.workflow.workflow = res;
        this.updateWorkflowProperties();
        this.updateTrails();
      }
      this.changeOwner = false;
    }, error => {
      this.changeOwner = false;
      this.updateWorkflowProperties();
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
  }

  /**
   * Set project title
   */
  setProjectTitle(): void {
    if (this.workflow && this.workflow.project && this.workflow.project.name) {
      this.projectTitle = [{
        id: this.workflow.project.id,
        name: this.workflow.project.name
      }]
    } else {
      this.projectTitle = []
    }
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
   * Clear project and workflow selections
   * @param workflow Workflow dropdown trigger
   */
  clearPW(workflow): void {
    this.previousProject = [...this.projectTitle];

    const title = workflow ? 'workflowTitle' : 'projectTitle';
    const list = workflow ? 'workFlowList' : 'projectsList';

    this[title] = [];
    this[list].map(x => x.checked = false);

    this.openReassignPopup('reAssignProject', null);
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
   * Open workflow reassign project popup
   * @param action Workflow reassign workflow
   * @param id Workflow ID
   */
  openReassignPopup(action: string, id: string): void {
    let message1 = '';
    let message2 = '';
    let buttonText = 'Delete';
    switch (action) {
      case 'reAssignProject':
        if (this.projectTitle[0]?.name) {
          message1 = this.workflow && this.workflow.project && this.workflow.project.name ? 'Re-Associate Workflow' : 'Associate Workflow';
          message2 = 'Assigning this workflow to ' + this.projectTitle[0].name;

          if (this.workflow && this.workflow.project && this.workflow.project.name) {
            message2 = message2 + ' will remove all association with ' + this.workflow.project.name + '.';
          }
          buttonText = this.workflow && this.workflow.project && this.workflow.project.name ? 'Re-Assign' : 'Assign';
        } else {
          message1 = 'Unassign Workflow';
          message2 = 'Unassigning this workflow will remove all association with ' + this.previousProject[0].name + '.';
          buttonText = 'Unassign';
        }

        break;
    }
    this.deleteObj = {
      action,
      message1,
      message2,
      buttonText,
      docToDelete: id
    };
    this.showModal.deleteDoc = true;
  }

  /**
   * Close reassign popup and reset messages and button texts
   */
  handleConfirmationResponse(): void {
    this.showModal.deleteDoc = false;
    this.deleteObj = { action: '', message1: '', message2: '', docToDelete: null, buttonText: 'Delete' };
  }

  /**
   * Handler for confirm modal component
   * @param resp Confiramtion response
   */
  confirmationDone(resp: boolean) {
    if (resp) {
      switch (this.deleteObj.action) {
        case 'reAssignProject':
          if (this.projectTitle && this.projectTitle.length) {
            this.updateWorkflow('reAssignProject', this.projectTitle[0].id);
          } else {
            this.updateWorkflow('reAssignProject', null);
          }
          break;
      }
    } else {
      switch (this.deleteObj.action) {
        case 'reAssignProject':
          this.projectTitle = this.previousProject;
          this.filterOptions('projectsList', this.previousProject.id);
          this.handleConfirmationResponse();
          break;
        default:
          this.handleConfirmationResponse();
          break;
      }
    }
  }
}
