import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { IProject } from '../projects/project/project.interface';
import { ITask } from '../projects/task/task.interface';
import { ISlides } from '../intro-slides/intro-slides.interface';
import * as fromRoot from '../../store';
import * as fromSavePermission from '../../store/reducers/permission.reducer';
import { DashboardService } from './dashboard.service';
import { ProjectService } from '../projects/project/project.service';
import { TaskService } from '../projects/task/task.service';
import { IntroService } from '../intro-slides/intro-slides.service';
import { SharedService } from '../../services/sharedService';
declare const google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  projectList$: Observable<fromSavePermission.PermissionState>;
  public objUser$: any;
  public userAvatar = '';
  public nameInitial = '';
  public firstName = '';
  public userName = '';
  public title = '';
  public module = 'welcome';
  public arrProjects: Array<IProject> = [];
  public arrTasks: Array<ITask> = [];
  public slides: Array<ISlides> = [];
  public isGanttView = false;
  public reverse = false;
  public permisionList: any = {};
  public chartView = false;
  public showModal = {
    isIntro: false
  };
  public taskDefaultParams = {
    status: '',
    limit: 5,
    offset: 0,
    ordering: 'rank',
    user: '',
    type: 'active'
  };
  public defaultParam = {
    status: '',
    limit: 5,
    offset: 0,
    ordering: 'rank',
    user: '',
    type: 'active'
  };
  dashboardSubscribe: any;
  public arrCheckedStatus = [];
  public showStatusFilter = false;
  public showUserAssignedFilter = false;
  public usersList: Array<any> = [];
  public userTitle = [];
  public isEmptyUpcomingGraph = false;
  public isTaskAssigned = true;
  public toggleProject = true;
  public toggleTask = true;

  constructor(
    private store: Store<fromRoot.AppState>,
    private projectService: ProjectService,
    private taskService: TaskService,
    private dashboardService: DashboardService,
    private introService: IntroService,
    public sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    this.objUser$ = this.store.select('userDetails').subscribe((obj: any) => {
      // User details
      const objUser = obj.datas;
      if (objUser) {
        this.firstName = `${objUser.first_name || ''}`;
        this.userName = `${objUser.first_name || ''} ${objUser.last_name || ''}`;
        this.title = `${objUser.title || ''}`;
        this.userAvatar = `${objUser.user_avatar || ''}`;
        const firstName: string = obj.datas.first_name || '';
        const lastName: string = obj.datas.last_name || '';
        this.nameInitial = firstName.charAt(0) + lastName.charAt(0);
      }
    });

    // API calls
    Promise.all([
      this.displayIntro(),
      this.getAssignedTask(),
      this.getUpcomingWeek(),
      this.getLists('user')
    ]);

    /**
     * Call projects and task if user has permissions
     */
    this.dashboardSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (this.permisionList.project_project_view || this.permisionList.project_project_view_all) {
            this.listProjects();
          }
          if (this.permisionList.task_task_view || this.permisionList.task_task_view_all) {
            this.listTask();
          }
        }
      }
    });
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.dashboardSubscribe) {
      this.dashboardSubscribe.unsubscribe();
    }

    if (this.objUser$) {
      this.objUser$.unsubscribe();
    }
  }

  /**
   * Display intro slides for dashboard
   */
  displayIntro = () => {
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
   * Get P/W/T for upcoming week
   */
  getUpcomingWeek = () => {
    this.dashboardService.getUpcomingWeek().subscribe(res => {
      if (res && res.detail) {
        const arrLabels: Array<string> = [];
        const arrTask: Array<number> = [];
        const arrWorkflow: Array<number> = [];
        const arrProject: Array<number> = [];
        const details = res.detail;

        // LOOPTHROUGH FOR SEVEN DAYS
        const startOfWeek = moment(new Date()).add(1, 'days');
        const endOfWeek = moment(new Date()).add(7, 'days');
        let day = startOfWeek;
        while (day <= endOfWeek) {
          let isproject = false;
          let isworkflow = false;
          let istask = false;
          const date = day.format('YYYY-MM-DD');
          if (details && details.length > 0) {
            for (var detail in details) {
              const detailDate = Object.keys(details[detail])[0];
              if (detailDate === date) {
                const data = details[detail][detailDate];
                //Project
                if (data && data.hasOwnProperty('project')) {
                  isproject = true;
                  arrProject.push(data.project);
                }
                //Workflow
                if (data && data.hasOwnProperty('workflow')) {
                  isworkflow = true;
                  arrWorkflow.push(data.workflow);
                }
                //Task
                if (data && data.hasOwnProperty('task')) {
                  istask = true;
                  arrTask.push(data.task);
                }
              }
            }
          }
          //Add 0 to if project dont have any value
          if (!isproject) {
            arrProject.push(0);
          }
          //Add 0 to if workflow dont have any value
          if (!isworkflow) {
            arrWorkflow.push(0);
          }
          //Add 0 to if task dont have any value
          if (!istask) {
            arrTask.push(0);
          }
          arrLabels.push(moment(day).format('MMM DD'));
          day = day.clone().add(1, 'd');
        }
        const pdata: Array<number> = arrProject.filter(x => x > 0);
        const wdata: Array<number> = arrWorkflow.filter(x => x > 0);
        const tdata: Array<number> = arrTask.filter(x => x > 0);
        if (arrLabels.length > 0 && (pdata.length > 0 || wdata.length > 0 || tdata.length > 0)) {
          this.isEmptyUpcomingGraph = false;
          this.displayBarGraph(arrLabels, arrProject, arrWorkflow, arrTask);
        } else {
          this.isEmptyUpcomingGraph = true;
        }
      }
    });
  }

  /**
   * Display bar graphs for upcoming P/W/T
   */
  displayBarGraph = (arrLabels, arrProject, arrWorkflow, arrTask) => {
    // tslint:disable-next-line:no-unused-expression
    new Chart(document.getElementById('bar-chart'), {
      type: 'bar',
      data: {
        labels: arrLabels,
        datasets: [
          {
            label: 'Project',
            backgroundColor: '#2B3777',
            data: arrProject
          },
          {
            label: 'Workflow',
            backgroundColor: '#485CC7',
            data: arrWorkflow
          },
          {
            label: 'Task',
            backgroundColor: '#DADEF4',
            data: arrTask
          }
        ]
      },
      options: {
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            fontFamily: 'stolzl regular'
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: true
            }
          }],
          yAxes: [{
            gridLines: {
              display: true
            },
            ticks: {
              beginAtZero: true,
              stepSize: 1
            }
          }]
        }
      }
    });
  }

  /**
   * Get assigned tasks
   */
  getAssignedTask = () => {
    this.dashboardService.getAssignedTask().subscribe(res => {
      if (res && res.detail) {
        if (res.detail.my_task > 0 || res.detail.our_task > 0 || res.detail.their_task > 0) {
          this.isTaskAssigned = true;
          this.displayDoughnutGraph(res.detail.my_task, res.detail.our_task, res.detail.their_task);
        } else {
          this.isTaskAssigned = false;
        }
      }
    });
  }

  /**
   * Display doughnut chart
   */
  displayDoughnutGraph = (myTask: number, ourTask: number, theirTask: number) => {
    const totalTasks = (myTask + ourTask + theirTask);
    // tslint:disable-next-line:no-unused-expression
    new Chart(document.getElementById('doughnut-chart'), {
      type: 'doughnut',
      data: {
        labels: ['My Task', 'Our Task', 'Their Task'],
        datasets: [
          {
            backgroundColor: ['#A1ACE7', '#485CC7', '#2B3777'],
            data: [myTask, ourTask, theirTask]
          }
        ]
      },
      options: {
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            fontFamily: 'stolzl regular'
          }
        },
      },
      plugins: [{
        beforeDraw(chart) {
          const width = chart.chart.width;
          const height = chart.chart.height;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '30px stolzl regular';
          ctx.textBaseline = 'middle';
          const text = `${totalTasks}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 - 10;

          ctx.fillText(text, textX, textY);
          ctx.save();
        },
        afterDraw(chart) {
          const width = chart.chart.width;
          const height = chart.chart.height;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '10px stolzl regular';
          ctx.textBaseline = 'middle';
          const text = `tasks`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 + 15;

          ctx.fillText(text, textX, textY);
          ctx.save();
        },
      }]
    });
  }

  /**
   * List projects
   */
  listProjects = (): void => {
    const params = {
      status: '1,4,5',
      limit: 3,
      offset: 0,
      ordering: '-rank'
    }
    this.projectService.listProjects(params).subscribe(res => {
      if (res && res.results) {
        this.arrProjects = res.results as Array<IProject>;
        this.arrProjects.map((obj: any) => {
          const arr = [];
          const totalTask = obj.project.task ? obj.project.task.total_task : 0;
          const completed = obj.project.task ? obj.project.task.completed_task : 0;
          const passedDue = obj.project.task ? obj.project.task.passed_due : 0;
          const Incompleted = (totalTask - completed);
          const tempPieGraph = {
            backgroundColor: totalTask > 0 ? ['#F73B22', '#485CC7', '#D4D8F2'] : ['#FFFFFF'],
            labels: totalTask > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
            data: totalTask > 0 ? [completed, Incompleted, passedDue] : [100],
            id: obj.id,
            isTooltip: totalTask > 0 ? true : false
          };
          arr.push(tempPieGraph);
          obj.chartProperties = [...arr];
        });
      }
    });
  }

  /**
   * Toggle gantt chart and table view
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
   * Render gantt chart
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
          avoidOverlappingGridLines: true,
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
              barLabel.style.left = (rectangles[i].getBBox().x + rectangles[i].getBBox().width + containerBounds.left) - 10 + 'px';
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
        tempData.map((b: ITask | any) => {
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
   * Navigate to task detail page.
   */
  redirectToDetail = (index: number) => {
    const data = this.arrTasks[index];
    if (data) {
      this.router.navigate(['main/projects/tasks/', data.task.id]);
    }
  }

  /**
   * Get tasks listing
   */
  listTask = () => {
    if (this.taskDefaultParams && this.taskDefaultParams.user) {
      (this.taskDefaultParams as any).assigned_to = this.taskDefaultParams.user;
      delete this.taskDefaultParams.user;
    }
    const params = Object.assign({}, this.taskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    const filteredParams: any = this.sharedService.filterParams(params);
    this.taskService.getTasks(filteredParams).subscribe(res => {
      if (res && res.results) {
        this.arrTasks = res.results as Array<ITask>;
      }
    });
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
    this.listTask();
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
    this.taskDefaultParams.status = status && status.length ? status.join() : '1,2,5,6';
    this.taskDefaultParams.offset = 0;
    this.listTask();
    this.showStatusFilter = false;
  }

  /**
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filter, filterSelection, filterTitle): void {
    this[filterSelection] = this[filterTitle] = [];
    this.taskDefaultParams[filter] = '';
    delete (this.taskDefaultParams as any).assigned_to;
    this.getLists(filter);
    this.listTask();
  }

  /**
   * Return filters listing
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 5
    };
    const filteredParams = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        this.getUsers(filteredParams);
        break;
    }
  }

  /**
   * Get users
   */
  getUsers = (filteredParams) => {
    this.taskService.getUsers(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        this.usersList = [...data];
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
      case 'user':
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
    }

    this.taskDefaultParams[filterType] = (groupObj && groupObj.length) ? this.setDefaultFilterVal(groupObj, filterType) : '';
    this.taskDefaultParams.offset = 0;
    this.listTask();
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
   * Return project completeness percentage
   * @param completedTasks Completed
   * @param totalTasks Total
   */
  completePercentOfProject(completedTasks, totalTasks): number {
    return completedTasks && totalTasks ? Math.ceil((completedTasks / totalTasks) * 100) : 0;
  }

  /**
   * Navigate to project detail page
   * @param id Project ID
   */
  goToProjectDetail(id: string): void {
    this.router.navigate(['/main/projects/' + id]);
  }
}
