import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ProjectService } from '../project.service';
import { TaskService } from '../../task/task.service';
import { SharedService } from '../../../../services/sharedService';
import { IProject } from '../project.interface';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { IntroService } from '../../../intro-slides/intro-slides.service';
import { ISlides } from '../../../intro-slides/intro-slides.interface';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import * as fromRoot from '../../../../store';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-projects-main',
  templateUrl: './projects-main.component.html',
  styleUrls: ['./projects-main.component.scss']
})
export class ProjectsMainComponent implements OnInit, OnDestroy {

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private introService: IntroService
  ) { }

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public chartProperties = [];
  public chartProperties1 = [];
  public projectTotal = 0;
  public arrProject: Array<IProject> = [];
  public defaultParam = {
    status: '1,4,5',
    limit: 12,
    offset: 0,
    user: '',
    group: '',
    tag: '',
    ordering: '-rank',
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
    totalProject: 0,
    notCompletedTasks: 0
  };
  public workGroupList: Array<any> = [];
  public tagsList: Array<any> = [];
  public usersList: Array<any> = [];
  public userTitle = [];
  public groupTitle = [];
  public tagTitle = [];
  public isProjectExpand = false;
  permissionSubs: any;
  permisionList: any = {};
  public module = 'project';
  public slides: Array<ISlides> = [];
  public openFilter = false;
  public openMetrics = true;
  public showModal = {
    isIntro: false
  };
  public isMobile: boolean = false;

  /**
   * List all projects
   */
  public arrProject0: Array<IProject> = [];
  public arrProject1: Array<IProject> = [];
  public arrProject2: Array<IProject> = [];

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParam.limit = +perPage === 10 ? 12 : +perPage;
    }

    // Check for mobile devices
    this.isMobile = this.sharedService.mainDetectMOB();

    // Get and check permissions for viewing project(s)
    this.permissionSubs = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (
            this.permisionList.project_project_view ||
            this.permisionList.project_project_view_all
          ) {
            this.initAsyncCall();
          }
        }
      }
    });
  }

  /**
   * API Calls when project listing component initialize
   */
  initAsyncCall(): void {
    // this.listProjects();
    Promise.all([
      this.searchUsingQuery(),
      this.displayIntro(),
      this.getProjectStatistics(),
      this.getLists('user'),
      this.getLists('group'),
      this.getLists('tag'),
    ]);
  }

  /**
   * Function to call active project items 
   */
  getActiveList = () => {
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '1,4,5',
      limit: 12,
      offset: 0,
      user: '',
      group: '',
      tag: '',
      ordering: '-rank',
      type: 'active'
    };
    this.appendQueryString();
  }

  /**
   * Function to call archieve project items
   */
  getArchivedList = () => {
    this.userTitle = this.userTitle.length > 0 ? this.clearUserList() : [];
    this.groupTitle = this.groupTitle.length > 0 ? this.clearGroupList() : [];
    this.tagTitle = this.tagTitle.length > 0 ? this.clearTagList() : [];
    this.defaultParam = {
      status: '2,3',
      limit: 12,
      offset: 0,
      user: '',
      group: '',
      tag: '',
      ordering: '-rank',
      type: 'archived'
    };
    this.appendQueryString();
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
          } else if (x === 'ordering') {
            this.defaultParam.ordering = this.defaultParam.ordering;
          } else if (x === 'type') {
            this.defaultParam.type = this.defaultParam.type;
          }
        }
      }
      this.listProjects();
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
          }
        }
      }
    });
  }

  /**
   * Display intro slides for projects
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

  listProjects = (loader?: boolean): void => {
    const params = this.sharedService.filterParams(this.defaultParam);
    const ajax = this.projectService.listProjects(params).toPromise();
    ajax.then(res => {
      if (res && res.results) {
        this.projectTotal = res.count as number;
        this.arrProject = res.results as Array<IProject>;
        this.arrProject0 = [], this.arrProject1 = [], this.arrProject2 = [];
        this.arrProject.map((obj: any, index: number) => {
          const totalTask = obj.project.task ? obj.project.task.total_task : 0;
          const completed = obj.project.task ? obj.project.task.completed_task : 0;
          const passedDue = obj.project.task ? obj.project.task.passed_due : 0;
          const incompleted = (totalTask - completed);
          const arr = [];
          const tempPieGraph = {
            backgroundColor: totalTask > 0 ? ['#F73B22', '#485CC7', '#D4D8F2'] : ['#FFFFFF'],
            labels: totalTask > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
            data: totalTask > 0 ? [completed, incompleted, passedDue] : [100],
            id: obj.id,
            isTooltip: totalTask > 0 ? true : false
          };
          arr.push(tempPieGraph);
          obj.chartProperties = [...arr];

          if ((index + 3) % 3 === 0) {
            this.arrProject0.push(obj);
          } else if ((index + 1) % 3 === 0) {
            this.arrProject2.push(obj);
          } else {
            this.arrProject1.push(obj);
          }
        });
      }
    });
  }

  /**
   * Pagination control for listing
   */
  loadMoreProjects = (offset: number) => {
    this.defaultParam.offset = offset;
    window.scroll(0, 0);
    this.listProjects();
  }

  /**
   * Project statistics data
   */
  getProjectStatistics = (): void => {
    const ajax = this.projectService.getProjectStatistics().toPromise();
    ajax.then(res => {
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
          totalProject: res.total_project || 0,
          notCompletedTasks: res.total_task - res.completed_task,
        };
        this.showPieChart();
        this.showPieChart1();
      }
    });
  }

  /**
   * Show Pie chart  for completed, incompleted and overdue tasks.
   */
  showPieChart(): void {
    const arr = [
      {
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#F73B22', '#485CC7', '#D4D8F2'] : ['#f8f8fd'],
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
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#e74c3c', '#FFFF00', '#00ff00'] : ['#f8f8fd'],
        labels: this.headerDetails.totalTasks > 0 ? ['High Priority', 'Medium Priority', 'Low Priority'] : [''],
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
   * Return filters listing
   */
  getLists = (filter: string, search?: any): void => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 100
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    switch (filter) {
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
   * Return users listing
   */
  getUsers = (filteredParams): void => {
    const ajax = this.taskService.getUsers(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        this.usersList = [...data];
        this.setTitle('user');
      }
    });
  }

  /**
   * Return work groups listing
   */
  getWorkGroups = (filteredParams): void => {
    const ajax = this.taskService.getWorkGroups(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.workGroupList = res.results;
        this.setTitle('group');
      }
    });
  }

  /**
   * Return tags listing
   */
  getTags = (filteredParams): void => {
    const ajax = this.taskService.getTags(filteredParams).toPromise();
    ajax.then(res => {
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
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filter, filterTitle): void {
    this[filterTitle] = [];
    this.getLists(filter);
    this.defaultParam[filter] = '';
    delete (this.defaultParam as any).group_member;
    // this.listProjects();
    this.appendQueryString();
  }

  /**
   * Trigger when filter selection changed
   * @param groupObj Selected filters
   * @param filterType Filter type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
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
    // this.listProjects();
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
   * Return workflow due date text
   * @param date Workflow due date
   */
  getWorkflowDueDateText(date) {
    if (date) {
      if (moment.utc(date).local().isSame(new Date(), 'day')) {
        return 'DUE TODAY';
      } else if (moment.utc(date).local().isSame(moment().subtract(1, 'day').toDate(), 'day')) {
        return 'DUE TOMORROW';
      } else {
        return 'DUE ' + moment.utc(date).local().format('MM/DD/YYYY');
      }
    }
    return '';
  }

  /**
   * Set filter in Listing API params
   * @param list Selected filters list
   * @param filterType Filter type
   */
  setDefaultFilterVal(list, filterType) {
    const ids = this[list].map(x => x.id);
    if (filterType === 'user') {
      (this.defaultParam as any).group_member = ids.join();
    } else {
      this.defaultParam[filterType] = ids.join();
    }
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
   * Navigate to project detail page
   * @param id Project ID
   */
  goToProjectDetail(id: string): void {
    this.router.navigate(['/main/projects/' + id]);
  }

  /**
   * Clear ALL filters (for responsive only)
   */
  clearAllFilters() {
    this.userTitle = [];
    this.groupTitle = [];
    this.tagTitle = [];
    this.defaultParam = {
      status: '1,4,5',
      limit: 12,
      offset: 0,
      user: '',
      group: '',
      tag: '',
      ordering: '-rank',
      type: 'active'
    };
    // this.listProjects(true);
    this.appendQueryString();
    this.openFilter = false;
  }

  /**
   * Handler for type by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParam.limit = perPage;
    this.defaultParam.offset = 0;
    // this.listProjects();
    this.appendQueryString();
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
   * @param event 
   * Function to check project card is drag & drop
   */
  drop(event: CdkDragDrop<string[]>): void {
    if (!this.permisionList.project_set_rank_drag_drop) {
      return this.notifier.displayErrorMsg('You do not have permission to perform this action.');
    }
    let params = new Object();
    let id: number = 0;
    let index = +event.container.element.nativeElement.id.split('-')[3];
    let pIndex = +event.previousContainer.element.nativeElement.id.split('-')[3];
    const titleArray = localStorage.getItem('title') || '';
    const title = titleArray ? JSON.parse(titleArray) : [];
    if (title && title.length > 0) {
      index = index - (title.length);
      pIndex = pIndex - (title.length);
    }

    if ((pIndex + 3) % 3 === 0) {
      id = this.arrProject0[event.previousIndex].id;
    } else if ((pIndex + 1) % 3 === 0) {
      id = this.arrProject2[event.previousIndex].id;
    } else {
      id = this.arrProject1[event.previousIndex].id;
    }

    if ((index + 3) % 3 === 0) {
      params = {
        drop_place: this.arrProject0[event.currentIndex].id
      };
    } else if ((index + 1) % 3 === 0) {
      params = {
        drop_place: this.arrProject2[event.currentIndex].id
      };
    } else {
      params = {
        drop_place: this.arrProject1[event.currentIndex].id
      };
    }
    this.projectService.project_rank(id, params).subscribe(res => {
      if (res) {
        const limit: number = this.defaultParam.limit;
        this.defaultParam.limit = limit;
        this.defaultParam.offset = 0;
        this.listProjects();
      }
    }, error => {
      //TODO:
    });
  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.permissionSubs) {
      this.permissionSubs.unsubscribe();
    }
  }
}
