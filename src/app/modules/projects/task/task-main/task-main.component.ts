import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { TaskService } from '../task.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedService } from 'src/app/services/sharedService';
import { Store } from '@ngrx/store';
import { Messages } from '../../../../services/messages';
import { IntroService } from '../../../intro-slides/intro-slides.service';
import { ISlides } from '../../../intro-slides/intro-slides.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import * as fromRoot from '../../../../store';
import * as  _ from 'lodash';
import * as moment from 'moment';
import * as html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-task-main',
  templateUrl: './task-main.component.html',
  styleUrls: ['./task-main.component.scss']
})

export class TaskMainComponent implements OnInit, OnDestroy {

  constructor(
    private taskService: TaskService,
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>,
    private introService: IntroService,
    private router: Router,
    private route: ActivatedRoute,
    private exportAsService: ExportAsService
  ) { }
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public tasks: Array<any> = [];
  public tasksCount = 0;
  public paginateArray = Array;
  public reverse = false;
  private filterLimit = 100;
  public workGroupList: Array<any> = [];
  public tagsList: Array<any> = [];
  public usersList: Array<any> = [];
  public workFlowList: Array<any> = [];
  public chartProperties = [];
  public chartProperties1 = [];
  public arrCheckedStatus = [];
  public showStatusFilter = false;
  public showUserAssignedFilter = false;
  public permisionList: any = {};
  private projectSubscribe: any;
  public defaultParam = {
    status: '',
    ordering: 'rank',
    limit: 10,
    offset: 0,
    user: '',
    group: '',
    tag: '',
    workflow: '',
    search: '',
    type: 'active'
  };
  private default = {
    status: '',
    ordering: 'rank',
    limit: 10,
    offset: 0,
    user: '',
    group: '',
    tag: '',
    workflow: '',
    search: '',
    type: 'active'
  };
  public statusChart: any;
  public priorityChart: any;
  public filterdata: any = {};
  public group = {};
  public header: any;
  public resourceType = 'my-task';
  public workFlowTitle = [];
  public userTitle = [];
  public groupTitle = [];
  public tagTitle = [];
  public searchPlaceholder = 'Search List';
  public module = 'task';
  public slides: Array<ISlides> = [];
  public openFilter = false;
  public openMetrics = true;
  public star = false;
  public showModal = {
    isIntro: false,
    isFavorite: false,
    shareMyList: false,
    isExport: false
  };
  errorMsgSubs: any;
  isMobile = false;
  public searchText = '';
  public rankid = 0;
  public taskName = '';
  timer: any;
  totalFavoriteTask = 0;
  public exportAsConfig: ExportAsConfig = {
    type: 'pdf',
    elementId: '',
    options: {
      jsPDF: {
        orientation: 'portrait'
      },
      margins: {
        top: '0',
      }
    }
  };

  public displayName: string = '';
  public displayEmail: string = '';

  /**
   * Configuration for generate csv
   */
  public isPdf: boolean = true;
  public CsvConfigConsts = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: false,
    useBom: true,
    noDownload: false,
    title: '',
    headers: [`RANK`, `TASK NAME`, `CREATED DATE`, `DUE DATE`, `IMPORTANCE`, `STATUS`, `COMPLETED %`, `ASSIGNED TO`]
  };

  /**
   * Handle mouse outside click event to close filters.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className !== '' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'btn fbtn' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'search_input ng-pristine ng-valid ng-touched' &&
      event.target.className !== 'search_input ng-untouched ng-pristine ng-valid' &&
      event.target.className !== 'check-list'
    ) {
      this.showStatusFilter = false;
      this.showUserAssignedFilter = false;
    }
  }
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.showModal.isExport = false;
    }
  }

  ngOnInit() {
    // Set user selected view by option
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParam.limit = +perPage === 12 ? 10 : +perPage;
    }

    // Check for mobile devices
    this.isMobile = this.sharedService.mainDetectMOB();

    // Error messages subscription
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(res => {
      if (res) {
        this.notifier.displayErrorMsg(res);
      }
    });

    // Get and check permissions for viewing task(s)
    this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (
            this.permisionList.task_task_view ||
            this.permisionList.task_task_view_all
          ) {
            this.initAllAsyncFunctionCall();
          }
        }
      }
    });

    // Get and check user details
    this.store.select('userDetails').subscribe(obj => {
      if (obj.datas) {
        this.displayName = `${obj.datas['first_name']} ${obj.datas['last_name']}`;
        this.displayEmail = `${obj.datas['email']}`;
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
   * API Calls when tasks listing component initialize
   */
  initAllAsyncFunctionCall = () => {
    Promise.all([
      this.searchUsingQuery(),
      this.displayIntro(),
      this.getLists('workflow'),
      this.getLists('user'),
      this.getLists('group'),
      this.getLists('tag'),
      this.getStatistics(),
    ]);
  }

  /**
   * Function to call active task items
   */
  getActiveList = () => {
    this.arrCheckedStatus = [];
    this.workFlowTitle = this.workFlowTitle.length > 0 ? this.clearWorkflowList() : [];
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '',
      ordering: 'rank',
      limit: 10,
      offset: 0,
      user: '',
      group: '',
      tag: '',
      workflow: '',
      search: '',
      type: 'active'
    };
    this.appendQueryString();
  }

  /**
   * Function to call archieve task items
   */
  getArchivedList = () => {
    this.arrCheckedStatus = [];
    this.workFlowTitle = this.workFlowTitle.length > 0 ? this.clearWorkflowList() : [];
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '',
      ordering: 'rank',
      limit: 10,
      offset: 0,
      user: '',
      group: '',
      tag: '',
      workflow: '',
      search: '',
      type: 'archived'
    };
    this.appendQueryString();
  }

  /**
   * Reset values of workflow list items in dropdown list
   */
  clearWorkflowList = () => {
    this.workFlowList.map(o => {
      o.checked = false
    });
    return this.workFlowTitle = [];
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
    const params = Object.assign({}, this.defaultParam);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    const filteredParams: any = this.sharedService.filterParams(params);
    if (filteredParams && filteredParams.user) {
      filteredParams.assigned_to = filteredParams.user;
      delete filteredParams.user;
    }
    if (filteredParams.hasOwnProperty('status') && filteredParams.status !== '') {
      delete filteredParams.type;
    }
    const queryParams = Object.assign({}, filteredParams);
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
          } else if (x === 'ordering') {
            this.defaultParam.ordering = this.defaultParam.ordering;
          } else if (x === 'type') {
            this.defaultParam.type = this.defaultParam.type;
          }
        }
      }
      this.getTasks();
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
          if (type === 'user' && x === 'assigned_to') {
            const arr = [... this.usersList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.userTitle = final;
          } else if (type === 'group' && x === 'group') {
            const arr = [... this.workGroupList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.groupTitle = final;
          } else if (type === 'tag' && x === 'tag') {
            const arr = [... this.tagsList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.tagTitle = final;
          } else if (type === 'workflow' && x === 'workflow') {
            const arr = [... this.workFlowList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.workFlowTitle = final;
          }
        }
      }
    });
  }

  /**
   * Display intro slides for tasks
   */
  displayIntro = () => {
    const ajax = this.introService.displayIntro(this.module).toPromise();
    ajax.then(res => {
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
   * Pagination control for listing
   */
  getData(res) {
    this.defaultParam.offset = res;
    window.scroll(0, 0);
    this.getTasks();
  }

  /**
   * List all tasks
   */
  getTasks = () => {
    this.showUserAssignedFilter = this.showStatusFilter = false;
    const params = Object.assign({}, this.defaultParam);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    const filteredParams: any = this.sharedService.filterParams(params);
    if (filteredParams && filteredParams.user) {
      filteredParams.assigned_to = filteredParams.user;
      delete filteredParams.user;
    }
    if (filteredParams && filteredParams.hasOwnProperty('status') && filteredParams.status !== '') {
      delete filteredParams.type;
    }
    const ajax = this.taskService.getTasks(filteredParams).toPromise();
    ajax.then(res => {
      if (res && res.results) {
        this.tasks = res.results;
        if (res && res.results && res.results.length) {
          this.totalFavoriteTask = res.results[0].total_favorite_task;
        }
        this.tasksCount = res.count ? res.count : 0;
      }
    });
  }

  /**
   * Handler for ordering tasks
   * @param orderBy Ordering key
   */
  orderByChange(orderBy: string): void {
    if (this.defaultParam.ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this.defaultParam.ordering = orderBy;
    }
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Show Pie chart  for completed, incompleted and overdue tasks.
   */
  showPieChart(): void {
    const arr = [
      {
        backgroundColor: this.header.totalTasks > 0 ? ['#485CC7', '#D4D8F2', '#F73B22'] : ['#f8f8fd'],
        labels: this.header.totalTasks > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
        data: this.header.totalTasks > 0 ? [this.header.completedTasks, this.header.notCompletedTasks, this.header.overdueTasks] : [100],
        id: 'taskStatusChart',
        fontSize: 9,
        isTooltip: this.header.totalTasks > 0 ? true : false
      }
    ];
    this.chartProperties = [...arr];
  }

  /**
   * Show Pie chart  for high, medium and low priority projects.
   */
  showPieChart1(): void {
    const arr = [
      {
        backgroundColor: this.header.totalTasks > 0 ? ['#F73B22', '#F9CD07', '#33C12E'] : ['#f8f8fd'],
        labels: this.header.totalTasks > 0 ? ['High', 'Medium', 'Low'] : [''],
        data: this.header.totalTasks > 0 ? [this.header.highPriority, this.header.mediumPriority, this.header.lowPriority] : [100],
        id: 'taskPriorityChart1',
        fontSize: 9,
        isTooltip: this.header.totalTasks > 0 ? true : false
      }
    ];
    this.chartProperties1 = [...arr];
  }

  /**
   * Return complete percentage
   */
  completePercent(): number {
    if (this.header && Object.keys(this.header).length && this.header.hasOwnProperty('completedTasks')) {
      const percent = !this.header.completedTasks ? 0
        : Math.ceil((this.header.completedTasks / this.header.totalTasks) * 100);
      return percent;
    }
  }

  /**
   * Set workgroup lisitng
   * @param res Workgroup response
   */
  setCompanyWorkGroup(res: any): void {
    this.workGroupList = res.results;
    this.setTitle('group');
  }

  /**
   * Set tags lisitng
   * @param res Tags response
   */
  setTagsList(res: any): void {
    this.tagsList = res.results.map((elem) => {
      elem.name = elem.tag;
      return elem;
    });
    this.setTitle('tag');
  }

  /**
   * Set users lisitng
   * @param res Users response
   */
  setUsersList(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.first_name + ' ' + elem.last_name;
      return elem;
    });
    this.usersList = [...data];
    this.setTitle('user');
  }

  /**
   * Set workflows lisitng
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
    // this.setTitle('workflow');
  }

  /**
   * Return filters listing
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : this.filterLimit
    };
    const filteredParams = this.sharedService.filterParams(params);
    switch (filter) {
      case 'workflow':
        this.getWorkFlows(filteredParams);
        break;
      case 'user':
        this.getUsers(filteredParams);
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
   * Get workflows
   */
  getWorkFlows = (filteredParams) => {
    const ajax = this.taskService.getWorkFlows(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setWorkFlows(res);
      }
    });
  }

  /**
   * Get users
   */
  getUsers = (filteredParams) => {
    const ajax = this.taskService.getUsers(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setUsersList(res);
      }
    });
  }

  /**
   * Get workgroups
   */
  getWorkGroups = (filteredParams) => {
    const ajax = this.taskService.getWorkGroups(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setCompanyWorkGroup(res);
      }
    });
  }

  /**
   * Get tags
   */
  getTags = (filteredParams) => {
    const ajax = this.taskService.getTags(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setTagsList(res);
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
      case 'workflow':
        this.setFilterTitle('workFlowList', 'workFlowTitle', groupObj);
        break;
      case 'user':
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
      case 'group':
        this.setFilterTitle('workGroupList', 'groupTitle', groupObj);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj);
        break;
    }
    this.defaultParam[filterType] = (groupObj && groupObj.length) ? this.setDefaultFilterVal(groupObj, filterType) : '';
    this.defaultParam.offset = 0;
    this.tasksCount = 0;
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Set filter in Listing API params
   * @param groupObj Selected filters list
   * @param filterType Filter type
   */
  setDefaultFilterVal(groupObj, filterType) {
    const data = this.defaultParam[filterType] = groupObj.join();
    return data;
  }

  /**
   * Handle drag and drop for tasks ranking
   * @param event Drop event
   */
  drop(event: CdkDragDrop<string[]>): void {

    if (!this.permisionList.task_set_rank_drag_drop) {
      return this.notifier.displayErrorMsg(Messages.errors.permissionErr);
    }

    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    if (event.currentIndex === event.previousIndex) {
      return;
    }

    const idx = event.currentIndex > event.previousIndex ? event.currentIndex - 1 : event.currentIndex + 1;
    const id = this.tasks[event.currentIndex].id;
    const body = {
      rank: this.tasks[idx].rank
    };
    this.taskService.taskRank(id, body).subscribe(() => {
      const limit: number = this.defaultParam.limit;
      this.searchText = '';
      this.defaultParam.search = '';
      this.defaultParam = Object.assign({}, this.default);
      this.defaultParam.limit = limit;
      this.defaultParam.offset = 0;
      // this.tasksCount = 0;
      // this.getTasks();
      this.appendQueryString();
    });
  }

  /**
   * Update task rank
   */
  rankUpdated = (data) => {
    if (data) {
      this.taskService.taskRank(data.rankId, { rank: data.rank }).subscribe(res => {
        const limit: number = this.defaultParam.limit;
        this.searchText = '';
        this.defaultParam.search = '';
        this.defaultParam = Object.assign({}, this.default);
        this.defaultParam.limit = limit;
        this.defaultParam.offset = 0;
        this.tasksCount = 0;
        // this.getTasks();
        this.appendQueryString();
      });
    }
  }

  /**
   * Get tasks header statisicts data
   */
  getStatistics = () => {
    const ajax = this.taskService.getStatistics().toPromise();
    ajax.then(res => {
      if (res) {
        this.header = {
          totalTasks: res.total_task || 0,
          completedTasks: res.completed || 0,
          notCompletedTasks: res.total_task - res.completed,
          overdueTasks: res.total_due || 0,
          dueTasks: res.due_today || 0,
          highPriority: res.high || 0,
          mediumPriority: res.med || 0,
          lowPriority: res.low || 0,
        };
        this.showPieChart();
        this.showPieChart1();
      }
    });
  }

  /**
   * Handler to filter tasks by status(s)
   * @param status Selected status from filter
   */
  selectTaskStatus(status: number[]) {
    this.arrCheckedStatus = status;
    this.defaultParam.status = status && status.length ? status.join() : '';
    this.defaultParam.offset = 0;
    // delete this.defaultParam.type;
    // this.getTasks();
    this.appendQueryString();
    this.showStatusFilter = false;
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
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filter, filterTitle): void {
    this[filterTitle] = [];
    this.getLists(filter);
    this.defaultParam[filter] = '';
    delete (this.defaultParam as any).assigned_to;
    // this.getTasks();
    this.appendQueryString();
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
   * Navigate to task detail page
   * @param id Task ID
   */
  openLink(id) {
    this.router.navigate(['/main/projects/tasks/', id]);
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
   * Clear ALL filters (for responsive only)
   */
  clearAllFilters() {
    this.workFlowTitle = [];
    this.userTitle = [];
    this.groupTitle = [];
    this.tagTitle = [];
    this.searchText = '';
    this.defaultParam.search = '';
    this.defaultParam = Object.assign({}, this.default);
    this.defaultParam.offset = 0;
    this.tasksCount = 0;
    // this.getTasks();
    this.appendQueryString();
    this.openFilter = false;
  }

  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParam.limit = perPage;
    this.defaultParam.offset = 0;
    if (this.searchText.trim().length) {
      this.defaultParam.search = this.searchText;
    }
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Handler for task searching
   */
  onSearch = (event) => {
    if (
      event.keyCode === 13 &&
      this.searchText &&
      this.searchText.trim() !== ''
    ) {
      this.searchTasks();
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        if (this.searchText && this.searchText.trim() !== '') {
          this.searchTasks();
        } else {
          this.clearSearch();
        }
      }, 1000);
    }
  }

  searchTasks() {
    const params: any = {
      search: this.searchText,
      limit: this.defaultParam.limit,
      offset: 0
    };
    this.defaultParam.search = this.searchText;
    if (this.defaultParam && this.defaultParam.user) {
      params.assigned_to = this.defaultParam.user;
    }
    if (this.defaultParam && this.defaultParam.status) {
      params.status = this.defaultParam.status;
    }
    if (this.defaultParam && this.defaultParam.workflow) {
      params.workflow = this.defaultParam.workflow;
    }
    if (this.defaultParam && this.defaultParam.group) {
      params.group = this.defaultParam.group;
    }
    if (this.defaultParam && this.defaultParam.tag) {
      params.tag = this.defaultParam.tag;
    }
    const ajax = this.taskService.getTasks(params).toPromise();
    ajax.then(res => {
      if (res && res.results) {
        this.tasks = res.results;
        this.tasksCount = res.count ? res.count : 0;
      }
    });
  }

  clearSearch = () => {
    this.searchText = '';
    this.defaultParam.search = '';
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Open mark task as favoutite popup
   */
  makeTaskFavourite = (
    totalFavoriteTask: number,
    rankid: number,
    isFavourite: boolean,
    taskName: string
  ) => {
    this.taskName = taskName;
    if (totalFavoriteTask < 25 || !isFavourite) {
      const params = {
        is_favorite: isFavourite
      };
      this.taskService.taskRank(rankid, params).subscribe(res => {
        if (res) {
          const taskMsg = isFavourite ? 'star' : 'unstar';
          this.notifier.displaySuccessMsg(`Task marked as ${taskMsg}`);
          this.getTasks();
        }
      }, (error) => {
        if (error) {
          if (error.error && typeof error.error.detail === 'string') {
            this.notifier.displayErrorMsg(error.error.detail);
          } else {
            if (error.error && error.error.detail) {
              this.notifier.displayErrorMsg(error.error.detail[0]);
            }
          }
        }
      });
    } else {
      this.rankid = rankid;
      this.showModal.isFavorite = true;
    }
  }

  /**
   * Close task favoutite popup
   */
  closeFavorite = (response) => {
    this.showModal.isFavorite = false;
    if (response) {
      this.taskService.taskRank(response, { is_favorite: false }).subscribe(res => {
        if (res) {
          this.makeTaskFavourite(0, this.rankid, true, '');
        }
      });
    } else {
      this.showModal.isFavorite = false;
    }
  }

  onDownload = () => {
    this.exportAsConfig.elementId = 'taskList';
    this.exportAsConfig.options.jsPDF.orientation = 'Portrait';
    const name = `Private-Task-${moment().format('YYYYMMDDhhmmss')}`;
    this.exportAsService.save(this.exportAsConfig, name).subscribe();
  }

  /**
   * Methods to share task with user privetely
   */
  onSelectMember = (memberId: number) => {
    if (memberId) {
      this.sharePrivateTask(memberId);
    } else {
      this.showModal.shareMyList = false;
    }
  }

  /**
   * Function to display popup of share my private task
   */
  sharePrivateTask = (memberId: number) => {
    this.showModal.shareMyList = false;
  }

  /**
   * Function to confirm action for share my private task
   */
  openCSVConfirm = () => {
    if (this.tasks && this.tasks.length > 0) {
      this.isPdf = true;
      this.showModal.isExport = true;
    } else {
      this.notifier.displayErrorMsg('Filtered task not found.');
    }
  }

  /**
   * Function to export favourite task as csv or pdf
   */
  exportTaks = () => {
    this.showModal.isExport = false;
    const reportName = `Task-Report${moment().format('MMDDYYYYHHmmss')}`;
    const params = {
      limit: 25,
      offset: 0,
      ordering: 'rank',
      // favorite_task: true,
      type: 'active'
    };
    this.taskService.getTasks(params).subscribe(res => {
      if (res && res.results && res.results.length > 0) {
        if (this.isPdf) {
          this.export2Pdf(reportName, res);
        } else {
          this.export2Csv(reportName, res);
        }
      }
    });
  }

  /**
   * Function to export favourite task as csv
   */
  export2Csv = (reportName: string, response: Array<any>) => {
    const csvTask = [];
    response['results'].map(o => {
      const params = {
        rank: o.rank,
        name: o.task.name,
        created_at: o.task.created_at ? moment(o.task.created_at).format('MM/DD/YYYY') : '',
        due_date: o.task.due_date ? moment(o.task.due_date).format('MM/DD/YYYY') : '',
        importance: o.task.importance === 1 ? `Low` : o.task.importance === 2 ? `Medium` : o.task.importance === 3 ? `High` : `Medium`,
        status: this.sharedService.taskStatus(o.task.status),
        completed_percentage: o.task.completed_percentage,
        assigned_to: `${o.task.assigned_to ? o.task.assigned_to.first_name : ''} ${o.task.assigned_to ? o.task.assigned_to.last_name : ''}`
      }
      csvTask.push(params);
    });
    new ngxCsv(csvTask, reportName, this.CsvConfigConsts);
    this.notifier.displaySuccessMsg('Filtered task exported successfully to csv.');
  }

  /**
   * Function to export favourite task as pdf
   */
  export2Pdf = (reportName: string, response: Array<any>) => {
    let dynamicDiv = '';
    const host = window.location.host;
    const proto = window.location.protocol;
    const baseUrl = proto + '//' + host + '/';

    response['results'].map(o => {
      const rank = o.rank;
      const due_date = o.task.due_date ? moment(o.task.due_date).format('MM/DD/YYYY') : '';
      const status = this.sharedService.taskStatus(o.task.status);
      const assigned_to = o.task.assigned_to ? `${o.task.assigned_to.first_name} ${o.task.assigned_to.last_name}` : '';
      const assigned_to_short = o.task.assigned_to ? `${o.task.assigned_to.first_name.charAt(0)} ${o.task.assigned_to.last_name.charAt(0)}` : '';

      //Table Row
      if (o.task.importance === 1) {
        dynamicDiv += `<div class="flex-ttable-item prow ttable-success">`;
      } else if (o.task.importance === 2) {
        dynamicDiv += `<div class="flex-ttable-item prow ttable-warn">`;
      } else if (o.task.importance === 3) {
        dynamicDiv += `<div class="flex-ttable-item prow ttable-danger">`;
      }
      //Rank With Star Div
      dynamicDiv += `<div class="ttable-rank">`;
      dynamicDiv += `<span class="ranking">${rank}</span>`;
      dynamicDiv += `<div class="star-task tooltip"><span class="tt_text"></span> <figure><img src="${baseUrl}assets/images/Star.png" /></figure> </div>`;
      dynamicDiv += `</div>`;
      //Rank With Star Div Ends

      //Task Name Div
      dynamicDiv += `<div class="ttable-full">`;
      dynamicDiv += `<a class="locked"> <img src="${baseUrl}assets/images/Private-Lock.png" width="12" height="12" /> ${o.task.name} </a>`;
      dynamicDiv += `</div>`;
      //Task Name Div Ends

      //Date Div
      dynamicDiv += `<div class="ttable-date"> ${due_date} </div>`;
      //Date Div Ends

      //Status Div
      dynamicDiv += `<div class="ttable-status"> ${status} </div>`;
      //Status Div Ends

      //Assign Div
      dynamicDiv += `<div class="ttable-assign">`;
      dynamicDiv += `<div class="profile-wrap">`;
      dynamicDiv += assigned_to_short ? `<span class="no-img">${assigned_to_short}</span>` : ``;
      dynamicDiv += `<p>${assigned_to}</p>`;
      dynamicDiv += `</div>`;
      dynamicDiv += `</div>`;
      //Assign Div Ends

      dynamicDiv += `</div>`;
      //Table Row Ends
    });
    this.generateHTML(reportName, baseUrl, dynamicDiv);
  }

  /**
   * Function to generate virtual html and export it as pdf
   */
  generateHTML = (reportName, baseUrl, dynamicDiv) => {
    html2pdf().set({
      pagebreak: {
        before: '',
        after: ['.rrow-item', '.card'],
        avoid: '.ritem', mode: 'legacy'
      }
    });
    let div = `<html>`;
    div += `<head>`;
    div += `<link href="https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap" rel="stylesheet"/>`;
    div += `<style type="text/css">`;
    div += `html, body { -webkit-text-size-adjust: none; -webkit-font-smoothing: antialiased; height: 100%; }`;
    div += `*, *:before, *:after { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }`;
    div += `body { font-family: Ubuntu, sans-serif; }`;
    div += `.header { margin-bottom: 20px; display: block; page-break-before: avoid;margin-top:0 !important;padding-top: 0!important;}`;
    div += ` .header-innerrow {display: flex;justify-content: space-between;align-items: center;margin:0 !important;padding-top: 0!important;}`;
    div += ` .header-innerrow .profile-wrap {max-width: 50%;display: flex;flex-direction: column;align-items: flex-end;margin: 0;flex:1;}`;
    div += ` .header-innerrow img {flex: 1;max-width: 100px;margin:0 !important;}`;

    div += `.sm-block-row { padding: 30px 0; width: 100%; }`;
    div += `.task-main-pg .ttable-rank span { border: none; color: rgb(21, 31, 43); opacity: 0.5; font-family: Ubuntu, sans-serif; font-weight: 500; background: transparent; padding: 0 5px; height: 30px; width: 30px; margin-right: 10px; display: flex; align-items: center; }`;
    div += `.task-main-pg .ttable-rank { width: 60px; }`;
    // div += `.container { max-width: 780px; width: 780px; padding-left: 15px; padding-right: 15px;margin: 0 auto; }`;
    div += `.container-virtual { max-width: 100%; width: 100%; padding-left: 15px; padding-right: 15px;margin: 0 auto; }`;
    div += `.ttable-row .titem-row-head.titem-bg { background: rgb(248, 248, 253); border-bottom-color: rgb(224, 224, 224); }`;
    div += `.locked { position: relative; padding-left: 20px; }`;
    div += `.locked img { margin: 0 5px 0 0; position: absolute; left: 0; top: 3px; }`;
    div += `.ttable-row .titem-row-head { display: -webkit-flex; display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: stretch; align-items: stretch; -webkit-justify-content: space-around; -moz-justify-content: space-between; -ms-justify-content: space-between; -o-justify-content: space-between; justify-content: space-between; cursor: pointer; border-bottom: 1px solid rgba(224, 224, 224, 0.4); min-height: 35px; background: rgb(255, 255, 255); text-transform: uppercase; color: rgba(0, 0, 0, 0.8); font-family: Ubuntu, sans-serif; font-weight: 600; padding: 5px 10px; }`;
    div += `.ttable-row .titem-row-head.titem-bg { background: rgb(248, 248, 253); border-bottom-color: rgb(224, 224, 224); }`;
    div += `.ttable-row .titem-row-head .titem { margin: 0; padding: 5px 10px; font-size: 12px; display: -webkit-flex; display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: center; align-items: center; -webkit-justify-content: flex-start; -moz-justify-content: flex-start; -ms-justify-content: flex-start; -o-justify-content: flex-start; justify-content: flex-start; position: relative;font-size:12px; }`;
    div += `.ttable-row .titem-row-head .titem a { margin: 0 5px; }`;
    div += `.ttable-row .titem-row-head .titem a img { margin: 2px 0; }`;
    div += `.ttable-row .titem-row-head .ttable-date { max-width: 135px; width: 15%; }`;
    div += `.ttable-row .titem-row-head .ttable-status { max-width: 135px; width: 20%; }`;
    div += `.ttable-row .titem-row-head .ttable-assign { max-width: 190px; width: 20%; }`;
    div += `.ttable-row .titem-row-head .ttable-full { -webkit-flex: 1; flex: 1; flex: 1; }`;
    div += `.ttable-row .flex-ttable-item { display: -webkit-flex; display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: center; align-items: center; -webkit-justify-content: space-between; -moz-justify-content: space-between; -ms-justify-content: space-between; -o-justify-content: space-between; justify-content: space-between; border: none; border-bottom: 1px solid rgba(224, 224, 224, 0.4); background: rgb(255, 255, 255); width: 100%; padding: 5px 10px; position: relative; color: rgba(21, 27, 59, 0.6); font-size: 12px; transition: all 0.3s ease; }`;
    div += `.ttable-row .flex-ttable-item:before { height: auto; width: 4px; top: 10px; left: 0; position: absolute; content: ""; bottom: 10px; }`;
    div += `.ttable-row .flex-ttable-item>div { padding: 5px 10px 4px; margin: 0; }`;
    div += `.ttable-row .flex-ttable-item>div:first-child { padding-left: 5px; }`;
    div += `.ttable-row .flex-ttable-item>div:last-child { padding-right: 5px; }`;
    div += `.ttable-row .flex-ttable-item>div a { color: rgb(21, 27, 59); display: inline; }`;
    div += `.ttable-row .flex-ttable-item.ttable-danger:hover { background: rgb(255, 247, 246); }`;
    div += `.ttable-row .flex-ttable-item.ttable-danger:before { background: rgb(247, 59, 34); }`;
    div += `.ttable-row .flex-ttable-item.ttable-gray:hover { background: rgb(189, 189, 220); }`;
    div += `.ttable-row .flex-ttable-item.ttable-gray:before { background: rgb(189, 189, 220); }`;
    div += `.ttable-row .flex-ttable-item.ttable-warn:hover { background: rgb(254, 252, 242); }`;
    div += `.ttable-row .flex-ttable-item.ttable-warn:before { background: rgb(249, 205, 7); }`;
    div += `.ttable-row .flex-ttable-item.ttable-success:hover { background: rgb(243, 248, 246); }`;
    div += `.ttable-row .flex-ttable-item.ttable-success:before { background: rgb(51, 193, 46); }`;
    div += `.ttable-row .flex-ttable-item .ttable-full { color: rgb(21, 27, 59); font-size: 12px; line-height: 18px; margin: 0; font-family: Ubuntu, sans-serif; font-weight: 400; -webkit-flex: 1; flex: 1; flex: 1; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: rgba(21, 27, 59, 1); font-size: 13px; }`;
    div += `.ttable-row .flex-ttable-item .ttable-rank { font-size: 12px; line-height: 18px; display: flex; padding: 0 15px; max-width: 90px; justify-content: flex-start; align-items: center; text-align: left; }`;
    div += `.ttable-row .flex-ttable-item .ttable-date { max-width: 135px; width: 15%; }`;
    div += `.ttable-row .flex-ttable-item .ttable-status { max-width: 135px; width: 20%; }`;
    div += `.ttable-row .flex-ttable-item .ttable-assign { max-width: 190px; width: 20%; min-height: 39px; }`;
    div += `.ttable-row .flex-ttable-item .ttable-assign .profile-wrap figure { margin-left: 0; }`;
    div += `.ttable-row .flex-ttable-item .ttable-assign .profile-wrap p { margin-left: 10px; }`;
    div += `.star-task { cursor: pointer; }`;
    div += `.star-task figure { background: rgb(247, 247, 247); padding: 3px; display: block; margin: 0 5px; }`;
    div += `.star-task img { max-width: 12px; }`;
    div += `.star-task:hover figure { background: rgb(21, 31, 43); }`;
    div += `.star-task:hover figure img { filter: brightness(200); }`;
    div += `.profile-wrap { display: flex; align-items: center; width: auto; justify-content: flex-end; }`;
    div += `.profile-wrap figure { max-width: 30px; border-radius: 100%; width: 30px; height: 30px; overflow: hidden; margin: 0; min-width: 30px; margin-left: -10px; }`;
    div += `.profile-wrap figure img { width: 100%; height: 100%; object-fit: cover; border-radius: 100%; }`;
    div += `.profile-wrap .no-img { height: 30px; width: 30px; display: flex; justify-content: center; align-items: center; border: 3px solid rgba(72, 92, 199, 0.5); border-radius: 100%; color: rgba(72, 92, 199, 1); font-family: Ubuntu, sans-serif; font-weight: 500; background: rgb(255, 255, 255); text-transform: uppercase; }`;
    div += `.profile-wrap p { margin: 0; flex: 1; margin-left: 10px; color: rgba(21, 27, 59, 0.6); font-size: 12px; line-height: 17px; font-family: Ubuntu, sans-serif; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;letter-spacing: 0;justify-content: center; }`;
    div += `.flex-ttable-item:nth-child(16n + 1) {page-break-after: always;}`;
    div += `.flex-ttable-item:first-child {page-break-after: avoid;margin-top: 0!important}`;
    div += `</style>`;
    div += `</head>`;
    div += `<body>`;
    div += `<div id="wrapper">`;
    div += `<div id="content-area">`;
    div += `<div class="main-page listing_pg">`;
    div += `<div id="taskList" class="sm-block-row task-main-pg">`;
    div += `<div class="container-virtual">`;
    div += `<div class="header">`;
    div += `<div class="header-innerrow">`;
    div += `<img height="" width="100" class="m-0" src="${baseUrl}/assets/images/dark-proxy.png" />`;
    div += `<div class="profile-wrap"><p> ${this.displayName} </p><p> ${this.displayEmail} </p></div>`;

    div += `</div>`;
    div += `<hr>`;
    div += `</div>`;
    div += `<div class="ttable-row">`;
    div += `<div class="titem-row-head titem-bg ph-row">`;
    div += `<span class="titem ttable-rank active" style="visibility: hidden; pointer-events: none;"> </span>`;
    div += `<span class="titem ttable-full"> Task Name</span>`;
    div += `<span class="titem ttable-date"> Due Date </span>`;
    div += `<span class="titem ttable-status pos-relative"> Status </span>`;
    div += `<span class="titem ttable-assign pos-relative"> Assigned To </span>`;
    div += `</div>`;
    div += `<div>`;
    div += dynamicDiv;
    div += `</div>`;
    div += `</div>`;
    div += `</div>`;
    div += `</div>`;
    div += `</div>`;
    div += `</div>`;
    div += `</div>`;
    div += `</body>`;
    div += `</html>`;
    html2pdf().from(div).save(reportName);
  }
}
