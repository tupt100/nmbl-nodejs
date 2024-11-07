import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../project/project.service';
import { WorkflowService } from '../workflow.service';
import { TaskService } from '../../task/task.service';
import { SharedService } from '../../../../services/sharedService';
import { IWorkflow, ITask } from '../workflow.interface';
import { IntroService } from '../../../intro-slides/intro-slides.service';
import { ISlides } from '../../../intro-slides/intro-slides.interface';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../store';
import * as _ from 'lodash';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  public chartProperties = [];
  public chartProperties1 = [];
  public arrWorkflow: Array<IWorkflow> = [];
  public arrTasks: Array<ITask> = [];
  public projectList: Array<any> = [];
  public workGroupList: Array<any> = [];
  public tagsList: Array<any> = [];
  public usersList: Array<any> = [];
  public taskUsersList: Array<any> = [];
  public projectTitle = [];
  public userTitle = [];
  public taskUserTitle = [];
  public groupTitle = [];
  public tagTitle = [];
  public workflowId = 0;
  public totalRecords = 0;
  public permisionList: any = {};
  permissionSubs: any;
  public defaultParam = {
    status: '1,4,5',
    limit: 10,
    offset: 0,
    project: '',
    user: '',
    group_member: '',
    group: '',
    tag: '',
    type: 'active'
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
  public taskDefaultParams = {
    status: '1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34',
    limit: 5,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: '',
    assigned_to: ''
  };
  public taskDefault = {
    status: '1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34',
    limit: 5,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: '',
    assigned_to: ''
  };
  public showStatusFilter = false;
  public taskTotalCount = 0;
  public reverse = false;
  public arrCheckedStatus = [1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34];
  public showUserAssignedFilter = false;
  public module = 'workflow';
  public slides: Array<ISlides> = [];
  public openFilter = false;
  public openMetrics = true;
  public showModal = {
    isIntro: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>,
    private introService: IntroService
  ) { }

  ngOnInit() {
    // Set user selected limit
    const perPage = localStorage.getItem('perPage');
    if (perPage && !isNaN(+perPage)) {
      this.defaultParam.limit = +perPage === 12 ? 10 : +perPage;
    }

    // Get and check permissions for viewing workflow(s)
    this.permissionSubs = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (
            this.permisionList.workflow_workflow_view ||
            this.permisionList.workflow_workflow_view_all
          ) {
            this.initAsyncCall();
          }
        }
      }
    });
  }

  /**
   * API Calls when workflows listing component initialize
   */
  initAsyncCall() {
    this.searchUsingQuery();
    this.displayIntro();
    this.getWorkflowStatistics();
    this.getLists('project');
    this.getLists('user', 'both');
    this.getLists('group');
    this.getLists('tag');
  }

  /**
   * Function to call active workflow items 
   */
  getActiveList = () => {
    this.projectList = this.projectList.length > 0 ? this.clearProjectList() : [];
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '1,4,5',
      limit: 10,
      offset: 0,
      project: '',
      user: '',
      group_member: '',
      group: '',
      tag: '',
      type: 'active'
    };
    this.appendQueryString();
  }

  /**
   * Function to call archieve workflow items
   */
  getArchivedList = () => {
    this.projectTitle = this.projectTitle.length > 0 ? this.clearProjectList() : [];
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '2,3',
      limit: 10,
      offset: 0,
      project: '',
      user: '',
      group_member: '',
      group: '',
      tag: '',
      type: 'archived'
    };
    this.appendQueryString();
  }

  /**
   * Reset values of project list items in dropdown list
   */
  clearProjectList = () => {
    this.projectList.map(o => {
      o.checked = false
    });
    return this.projectTitle = [];
  }

  /**
   * Reset values of user list items in dropdown list
   */
  clearUserList = () => {
    this.usersList.map(o => {
      o.checked = false
    });
    return this.userTitle = [];
  }

  /**
   * Reset values of group list items in dropdown list
   */
  clearGroupList = () => {
    this.workGroupList.map(o => {
      o.checked = false
    });
    return this.groupTitle = [];
  }

  /**
   * Reset values of tag list items in dropdown list
   */
  clearTagList = () => {
    this.tagsList.map(o => {
      o.checked = false
    });
    return this.tagTitle = [];
  }

  /**
   * Functions to append queryString values and refresh url
   */
  appendQueryString = () => {
    const params = this.sharedService.filterParams(this.defaultParam);
    const queryParams = Object.assign({}, params);
    this.router.navigate(['.'], { relativeTo: this.route, queryParams });
  }

  /**
   * Function to read queryString values and populate results based on it.
   */
  searchUsingQuery = () => {
    this.route.queryParams.subscribe((params: any) => {
      this.defaultParam = Object.assign({}, this.defaultParam, params);
      for (const x in this.defaultParam) {
        if (this.defaultParam[x]) {
          if (x === 'limit') {
            this.defaultParam.limit = +this.defaultParam.limit;
          } else if (x === 'type') {
            this.defaultParam.type = this.defaultParam.type;
          }
        }
      }
      this.listWorkflow();
    });
  }

  /**
   * Function to set searched values when we navigate between pages.
   */
  setTitle = (type) => {
    this.route.queryParams.subscribe((params: any) => {
      const param = Object.assign({}, params);
      for (const x in param) {
        if (param[x]) {
          const values = param[x].split(',');
          if (x === 'user') {
            const arr = [... this.usersList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.userTitle = final;
          } else if (x === 'group') {
            const arr = [... this.workGroupList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.groupTitle = final;
          } else if (x === 'tag') {
            const arr = [... this.tagsList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.tagTitle = final;
          } else if (x === 'project') {
            const arr = [... this.projectList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.project.id.toString())) {
                return y;
              }
            });
            this.projectTitle = final;
          }
        }
      }
    });
  }

  /**
   * Display intro slides for workflows
   */
  displayIntro() {
    this.introService.displayIntro(this.module).subscribe(res => {
      if (res && res.introslide && res.introslide.length > 0) {
        this.slides = res.introslide as Array<ISlides>;
        this.slides.map((obj, index) => {
          if (index === 0) {
            obj.slide.selected = true;
          } else {
            obj.slide.selected = false;
          }
        });
        this.showModal.isIntro = true;
      }
    });
  }

  /**
   * Close Intro Slides Popup
   */
  onClose = (response) => {
    if (response) {
      this.showModal.isIntro = false;
    }
  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.permissionSubs) {
      this.permissionSubs.unsubscribe();
    }
  }

  /**
   * List all workflows
   */
  listWorkflow = (): void => {
    const params = this.sharedService.filterParams(this.defaultParam);
    this.workflowService.listWorkflow(params).subscribe(res => {
      this.totalRecords = res.count as number;
      if (res && res.results) {
        const data = res.results.map(obj => ({ ...obj, expand: false })) as Array<IWorkflow>;
        data.map((obj: any) => {
          obj.width = this.getCompleted(obj.workflow.total_task, obj.workflow.completed_task);
        });
        this.arrWorkflow = [...data];
      }
    });
  }

  /**
   * Pagination control for listing
   */
  loadMoreData = (offset: number): void => {
    this.defaultParam.offset = offset;
    window.scroll(0, 0);
    this.listWorkflow();
  }

  /**
   * Get workflows header statisicts data
   */
  getWorkflowStatistics() {
    this.workflowService.getWorkflowStatistics().subscribe(res => {
      if (res) {
        this.headerDetails = {
          completedTasks: res.completed_task || 0,
          dueTasks: res.due_today || 0,
          highPriority: res.high || 0,
          mediumPriority: res.mid || 0,
          lowPriority: res.low || 0,
          overdueTasks: res.total_due || 0,
          totalTasks: res.total_task || 0,
          totalWorkflow: res.total_workflow || 0,
          notCompletedTasks: res.total_task - res.completed_task,
        };
        this.showPieChart();
        this.showPieChart1();
      }
    });
  }

  /**
   * Get tasks lisitng for selected workflow.
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
    if (this.taskDefaultParams && this.taskDefaultParams.user) {
      (this.taskDefaultParams as any).assigned_to = this.taskDefaultParams.user;
      delete this.taskDefaultParams.user;
    } else {
      delete (this.taskDefaultParams as any).assigned_to;
    }

    let params: any = Object.assign({}, this.taskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    params = this.sharedService.filterParams(params);
    this.workflowService.listWorkflowTasks(params).subscribe(res => {
      if (res && res.results) {
        this.taskTotalCount = res.count as number;
        this.arrTasks = res.results as Array<ITask>;
      }
    });
  }

  /**
   * Collapse workflow
   */
  closeWorkflowTab = (workflow: IWorkflow) => {
    (workflow as any).expand = false;
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
   * Show Pie chart  for completed, incompleted and overdue tasks.
   */
  showPieChart(): void {
    const arr = [
      {
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#485CC7', '#D4D8F2', '#F73B22'] : ['#f8f8fd'],
        labels: this.headerDetails.totalTasks > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
        data: this.headerDetails.totalTasks > 0
          ? [this.headerDetails.completedTasks, this.headerDetails.notCompletedTasks, this.headerDetails.overdueTasks]
          : [100],
        id: 'chart1',
        fontSize: 9,
        isTooltip: this.headerDetails.totalTasks > 0 ? true : false
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
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#f73b22', '#f9cd07', '#33c12e'] : ['#f8f8fd'],
        labels: this.headerDetails.totalTasks > 0 ? ['High', 'Medium', 'Low'] : [''],
        data: this.headerDetails.totalTasks > 0
          ? [this.headerDetails.highPriority, this.headerDetails.mediumPriority, this.headerDetails.lowPriority]
          : [100],
        id: 'chart2',
        fontSize: 9,
        isTooltip: this.headerDetails.totalTasks > 0 ? true : false
      }
    ];
    this.chartProperties1 = [...arr];
  }

  /**
   * Return filters listing
   */
  getLists = (filterText: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 100
    };
    const filteredParams = this.sharedService.filterParams(params);
    switch (filterText) {
      case 'project':
        this.getProjects(filteredParams);
        break;
      case 'user':
        this.getUsers(filteredParams, search);
        break;
      case 'taskUsers':
        this.getUsers(filteredParams, true);
        break;
      case 'group':
        this.getWorkGroups(filteredParams);
        break;
      case 'tag':
        this.getTags(filteredParams);
        break;
    }
  }

  /**
   * Get projects listing
   */
  getProjects = (filteredParams: any) => {
    this.projectService.listProjects(filteredParams).subscribe(res => {
      this.projectList = res.results.map((elem) => {
        elem.name = elem.project.name;
        return elem;
      });
      this.setTitle('project');
    });
  }

  /**
   * Get users listing
   */
  getUsers = (filteredParams: any, task?: boolean | string) => {
    this.taskService.getUsers(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        if (task === 'both') {
          this.taskUsersList = JSON.parse(JSON.stringify(data));
          this.usersList = JSON.parse(JSON.stringify(data));
          this.setTitle('user');
        } else {
          const key = task === true ? 'taskUsersList' : 'usersList';
          this[key] = data;
          this.setTitle('user');
        }
      }
    });
  }

  /**
   * Get workgroups listing
   */
  getWorkGroups = (filteredParams: any) => {
    this.taskService.getWorkGroups(filteredParams).subscribe(res => {
      if (res) {
        this.workGroupList = res.results;
        this.setTitle('group');
      }
    });
  }

  /**
   * Get tags listing
   */
  getTags = (filteredParams: any) => {
    this.taskService.getTags(filteredParams).subscribe(res => {
      if (res) {
        this.tagsList = res.results.map((elem) => {
          elem.name = elem.tag;
          return elem;
        });
        this.setTitle('tag');
      }
    });
  }

  /**
   * Trigger when filter selection changed
   * @param groupObj Selected filters
   * @param filterType Filter type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'project':
        this.setFilterTitle('projectList', 'projectTitle', groupObj);
        this.setDefaultFilterVal('projectTitle', filterType);
        break;
      case 'user':
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        this.setDefaultFilterVal('userTitle', filterType);
        break;
      case 'group':
        this.setFilterTitle('workGroupList', 'groupTitle', groupObj);
        this.setDefaultFilterVal('groupTitle', filterType);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj);
        this.setDefaultFilterVal('tagTitle', filterType);
        break;
    }
    this.defaultParam.offset = 0;
    // this.listWorkflow();
    this.appendQueryString();
  }

  /**
   * Handle filter selections
   * @param data Filter list
   * @param title Filter selection list
   * @param groupObj selected filters from listing
   */
  setFilterTitle(data, title, groupObj) {
    const ad = [];
    this[data].forEach(x => {
      if (groupObj.indexOf(x.id) > -1) {
        ad.push(x);
      }
    });
    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Set filter in Listing API params
   * @param list Selected filters list
   * @param filterType Filter type
   */
  setDefaultFilterVal(list, filterType) {
    const ids = filterType === 'project' ? this[list].map(x => x.project.id) : this[list].map((x: any) => x.id);
    if (filterType === 'user') {
      this.defaultParam.group_member = ids.join();
    }
    this.defaultParam[filterType] = ids.join();
  }

  /**
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filterText, filterTitle): void {
    this[filterTitle] = [];
    this.getLists(filterText);
    if (filterText === 'user') {
      this.defaultParam.group_member = '';
    }
    this.defaultParam[filterText] = '';
    // this.listWorkflow();
    this.appendQueryString();
  }

  /**
   * Reset assigned to user filter under task header
   */
  clearAssignToSelections() {
    this.taskUserTitle = [];
    this.getLists('taskUsers');
    this.taskDefaultParams.user = '';
    this.showUserAssignedFilter = false;
    this.getWorkflowTasks(this.workflowId);
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
    this.getWorkflowTasks(this.workflowId);
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
    this.taskDefaultParams.status = status && status.length ? status.join() : '';
    this.taskDefaultParams.offset = 0;
    this.getWorkflowTasks(this.workflowId);
    this.showStatusFilter = false;
  }

  /**
   * Handler for changing assign to user filter
   * @param groupObj Selected user list
   * @param filterType Tasks user filter
   */
  onAssignedUserSelected(groupObj, filterType): void {
    this.setFilterTitle('taskUsersList', 'taskUserTitle', groupObj);
    const ids = this.taskUserTitle.map(x => x.id);
    this.taskDefaultParams[filterType] = (ids && ids.length) ? ids.join() : '';
    this.taskDefaultParams.offset = 0;
    this.getWorkflowTasks(this.workflowId);
    this.showUserAssignedFilter = false;
  }

  /**
   * Navigate to workflow detail page
   */
  workflowDetail = (id: number) => {
    this.router.navigate(['main/projects/workflow', id]);
  }

  /**
   * Clear ALL filters (for responsive only)
   */
  clearAllFilters() {
    this.projectTitle = [];
    this.userTitle = [];
    this.groupTitle = [];
    this.tagTitle = [];
    this.defaultParam = {
      status: '1,4,5',
      limit: 10,
      offset: 0,
      project: '',
      user: '',
      group_member: '',
      group: '',
      tag: '',
      type: 'active'
    };
    // this.listWorkflow();
    this.appendQueryString();
    this.openFilter = false;
  }

  /**
   * Return selected filter names (for responsive only)
   * @param title Selected filters array
   */
  getTitle(title) {
    if (this[title] && this[title].length) {
      let t = '';
      this[title].forEach(x => {
        t += x.name || x.tag || x.title;
        t += ', ';
      });
      t = t.substring(0, t.length - 2);
      return t;
    }
  }

  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParam.limit = perPage;
    this.defaultParam.offset = 0;
    // this.listWorkflow();
    this.appendQueryString();
  }
}
