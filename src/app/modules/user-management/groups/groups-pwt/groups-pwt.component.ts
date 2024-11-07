import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../group.service';
import { ProjectService } from '../../../projects/project/project.service';
import { WorkflowService } from '../../../projects/workflow/workflow.service';
import { TaskService } from '../../../projects/task/task.service';
import { SharedService } from '../../../../services/sharedService';
import { IProject } from '../../../projects/project/project.interface';
import { IWorkflow } from '../../../projects/workflow/workflow.interface';
import { ITask } from '../../../projects/task/task.interface';
import { IGroupDetails } from '../../user-management.interface';
import { Chart } from 'chart.js';
import * as _ from 'lodash';
import * as moment from 'moment';
declare const google: any;

@Component({
  selector: 'app-groups-pwt',
  templateUrl: './groups-pwt.component.html',
  styleUrls: ['./groups-pwt.component.scss']
})
export class GroupsPwtComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    public sharedService: SharedService
  ) { }

  public chartProperties = [];
  public chartProperties1 = [];
  public groupName = '';
  public arrProjects: Array<IProject> = [];
  public arrWorkflow: Array<IWorkflow> = [];
  public arrGroups: Array<IGroupDetails> = [];
  public arrTasks: Array<ITask> = [];
  public barOptionsStacked = {
    scales: {
      xAxes: [{
        gridLines: {
          display: true
        },
        ticks: {
          display: false
        },
        stacked: true
      }],
      yAxes: [{
        barThickness: 3,
        gridLines: {
          display: false,
          color: '#151B3B',
          zeroLineColor: '#151B3B',
          zeroLineWidth: 0
        },
        ticks: {
          fontFamily: 'stolzl regular',
          fontSize: 11,
          display: true
        },
        stacked: true,
      }]
    },
    legend: {
      display: false,
      labels: {
        fontFamily: 'stolzl regular'
      }
    },
  };
  public headerDetails = {
    lowPriority: 0,
    mediumPriority: 0,
    highPriority: 0,
    totalTasks: 0,
    completedTasks: 0,
    notCompletedTasks: 0
  };
  public totalProjectCount = 0;
  public projDefaultParams = {
    status: '1,4,5',
    limit: 12,
    offset: 0,
    group: 0
  };
  public totalWorkflowCount = 0;
  public workflowDefaultParams = {
    status: '1,4,5',
    limit: 10,
    offset: 0,
    group: 0
  };
  public workflowTaskDefaultParams = {
    status: '',
    limit: 5,
    offset: 0,
    workflow: 0,
    ordering: 'rank',
    user: '',
    type: 'active'
  };
  public totalTaskCount = 0;
  workflowTaskTotalCount = 0;
  arrWorflowTasks = [];
  public taskDefaultParams = {
    status: '',
    limit: 10,
    offset: 0,
    group: 0,
    user: '',
    ordering: 'rank',
    type: 'active'
  };
  public tabs = {
    projects: true,
    workflows: true,
    task: true,
    document: true
  };
  public reverse = false;
  public arrCheckedStatus = [];
  public arrCheckedWTStatus = [];
  public showUserAssignedFilter = false;
  public showWTUserAssignedFilter = false;
  public showStatusFilter = false;
  public showWTStatusFilter = false;
  public userTitle = [];
  public taskUserTitle = [];
  public usersList: Array<any> = [];
  public taskUsersList: Array<any> = [];
  public defaultParam = {
    status: '1,4,5',
    limit: 10,
    offset: 0,
    project: '',
    user: '',
    group: '',
    tag: '',
  };
  public workflowId = 0;

  public isGanttView = false;

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.taskDefaultParams.limit = +perPage === 12 ? 10 : +perPage;
      this.workflowDefaultParams.limit = +perPage === 12 ? 10 : +perPage;
      this.projDefaultParams.limit = +perPage === 10 ? 12 : +perPage;
    }
    this.activatedRoute.params.subscribe(params => {
      const id = params.id || '';
      this.projDefaultParams.group = id;
      this.workflowDefaultParams.group = id;
      this.taskDefaultParams.group = id;
      if (id) {
        Promise.all([
          this.getUserWorkgroupDetails(id),
          this.listGroupProjects(),
          this.listGroupWorkflows(),
          this.listGroupTasks(),
          this.getWorkgroupDetailStatistic(id),
          this.getLists('user'),
          this.getLists('taskUsers')
        ]);
      }
    });
  }

  /**
   * @param id id
   * Function to get user's workgroup details
   */
  getUserWorkgroupDetails = (id: number) => {
    this.groupService.userwork_group_by_id(id).subscribe(res => {
      if (res) {
        this.arrGroups = res.group_members as Array<IGroupDetails>;
      }
    });
  }

  /**
   * Function to get group's project
   */
  listGroupProjects = () => {
    this.projectService.listProjects(this.projDefaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalProjectCount = res.count as number;
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
   * @param completedTasks completedTasks
   * @param totalTasks totalTasks
   * Function to check complated project percentage
   */
  completePercentOfProject(completedTasks, totalTasks): number {
    if (completedTasks && totalTasks) {
      return Math.ceil((completedTasks / totalTasks) * 100);
    } else {
      return 0;
    }
  }

  /**
   * @param offset offset
   * Function to load more projects
   */
  loadMoreProjects = (offset: number) => {
    this.projDefaultParams.offset = offset;
    this.listGroupProjects();
  }

  /**
   * Function to get group's workflow
   */
  listGroupWorkflows = () => {
    this.workflowService.listWorkflow(this.projDefaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalWorkflowCount = res.count as number;
        this.arrWorkflow = res.results as Array<IWorkflow>;
        this.arrWorkflow.map((obj: any) => {
          obj.width = this.getCompleted(obj.workflow.total_task, obj.workflow.completed_task);
        });
      }
    });
  }

  /**
   * @param id id
   * Function to get task of specific workflow
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
    this.workflowTaskDefaultParams.workflow = id;
    if (this.workflowTaskDefaultParams && this.workflowTaskDefaultParams.user) {
      (this.workflowTaskDefaultParams as any).assigned_to = this.workflowTaskDefaultParams.user;
      delete this.workflowTaskDefaultParams.user;
    } else {
      delete (this.workflowTaskDefaultParams as any).assigned_to;
    }

    let params: any = Object.assign({}, this.workflowTaskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    params = this.sharedService.filterParams(params);
    this.workflowService.listWorkflowTasks(params).subscribe(res => {
      if (res && res.results) {
        this.workflowTaskTotalCount = res.count as number;
        this.arrWorflowTasks = res.results as Array<ITask>;
      }
    });
  }

  /**
   * @param workflow workflow
   * Function to expand tab
   */
  closeWorkflowTab = (workflow: IWorkflow) => {
    (workflow as any).expand = false;
  }

  /**
   * @param id id
   * Function to navigate to workflow detail page
   */
  workflowDetail = (id: number) => {
    this.router.navigate(['main/projects/workflow', id]);
  }

  /**
   * @param totalTasks totalTasks
   * @param completedTasks completedTasks
   * Function to return percentage completed
   */
  getCompleted(totalTasks, completedTasks): number {
    return Math.ceil((completedTasks / totalTasks) * 100);
  }

  /**
   * @param offset offset
   * Function to load more group data
   */
  loadMoreGroupData = (offset: number): void => {
    this.workflowDefaultParams.offset = offset;
    this.listGroupWorkflows();
  }

  /**
   * Function to get group's task
   */
  listGroupTasks = () => {
    if (this.taskDefaultParams && this.taskDefaultParams.user) {
      (this.taskDefaultParams as any).assigned_to = this.taskDefaultParams.user;
      delete this.taskDefaultParams.user;
    }

    const params = Object.assign({}, this.taskDefaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    const filteredParams: any = this.sharedService.filterParams(params);
    this.taskService.getTasks(filteredParams).subscribe(res => {
      if (res && res.results) {
        this.totalTaskCount = res.count as number;
        this.arrTasks = res.results as Array<ITask>;
      }
    });
  }

  /**
   * @param offset offset
   * Function to load more group's task
   */
  loadMoreGroupTask = (offset: number): void => {
    this.taskDefaultParams.offset = offset;
    this.listGroupTasks();
  }

  /**
   * @param orderBy orderBy
   * @param workflowTasks workflowTasks
   * Function to order by list data
   */
  orderByChange(orderBy: string, workflowTasks?: boolean): void {
    const paramKey = workflowTasks ? 'workflowTaskDefaultParams' : 'taskDefaultParams';
    if (this[paramKey].ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this[paramKey].ordering = orderBy;
    }
    if (workflowTasks) {
      this.getWorkflowTasks(this.workflowId);
    } else {
      this.listGroupTasks();
    }
  }

  /**
   * @param filter1 filter1
   * @param filter2 filter2
   * Function to hide / show filters
   */
  handleFilterShow(filter1, filter2): void {
    this[filter1] = !this[filter1];
    this[filter2] = false;
  }

  /**
   * @param status status
   * @param workflowTasks workflowTasks
   * Function to select task status
   */
  selectTaskStatus(status: number[], workflowTasks?: boolean) {
    const paramKey = workflowTasks ? 'workflowTaskDefaultParams' : 'taskDefaultParams';
    const valueKey = workflowTasks ? 'arrCheckedWTStatus' : 'arrCheckedStatus';
    const filterKey = workflowTasks ? 'showWTStatusFilter' : 'showStatusFilter';

    this[valueKey] = status;
    this[paramKey].status = status && status.length ? status.join() : '1,2,3,4,5,6';
    this[paramKey].offset = 0;

    if (workflowTasks) {
      this.getWorkflowTasks(this.workflowId);
    } else {
      this.listGroupTasks();
    }

    this[filterKey] = false;
  }

  /**
   * @param groupObj groupObj
   * @param filterType filterType
   * Function to set default values
   */
  setDefaultFilterVal(groupObj, filterType) {
    const data = this.defaultParam[filterType] = groupObj.join();
    return data;
  }

  /**
   * @param groupObj groupObj
   * @param filterType filterType
   * @param workflowTasks workflowTasks
   * Function to select assigned users
   */
  onAssignedUserSelected(groupObj, filterType, workflowTasks?: boolean): void {
    const paramKey = workflowTasks ? 'workflowTaskDefaultParams' : 'taskDefaultParams';
    const userListKey = workflowTasks ? 'taskUsersList' : 'usersList';
    const userListTitle = workflowTasks ? 'taskUserTitle' : 'userTitle';
    const filterKey = workflowTasks ? 'showWTUserAssignedFilter' : 'showUserAssignedFilter';

    this.setFilterTitle(userListKey, userListTitle, groupObj);
    const ids = this[userListTitle].map(x => x.id);
    this[paramKey][filterType] = (ids && ids.length) ? ids.join() : '';
    this[paramKey].offset = 0;
    if (workflowTasks) {
      this.getWorkflowTasks(this.workflowId);
    } else {
      this.listGroupTasks();
    }
    this[filterKey] = false;
  }

  /**
   * @param workflowTasks workflowTasks
   * Function to clear assigned to selection
   */
  clearAssignToSelections(workflowTasks?: boolean) {
    const userListTitle = workflowTasks ? 'taskUserTitle' : 'userTitle';
    const userkey = workflowTasks ? 'taskUsers' : 'user';
    const paramKey = workflowTasks ? 'workflowTaskDefaultParams' : 'taskDefaultParams';
    const filterKey = workflowTasks ? 'showWTUserAssignedFilter' : 'showUserAssignedFilter';
    this[userListTitle] = [];
    this.getLists(userkey);
    delete this[paramKey].user;
    delete (this[paramKey] as any).assigned_to;
    this[filterKey] = false;
    if (workflowTasks) {
      this.getWorkflowTasks(this.workflowId);
    } else {
      this.listGroupTasks();
    }
  }

  /**
   * @param data data
   * @param title title
   * @param groupObj groupObj
   * Function to set filter titles
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
   * @param filter filter
   * @param search search
   * Function to get list of data by filters provided
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : 100
    };
    const filteredParams = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        this.getUsers(filteredParams);
        break;
      case 'taskUsers':
        this.getUsers(filteredParams, true);
        break;
    }
  }

  /**
   * @param filteredParams filteredParams
   * @param workflowTaskUsers workflowTaskUsers
   * Function to get user's list
   */
  getUsers = (filteredParams, workflowTaskUsers?: boolean) => {
    this.taskService.getUsers(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        const key = workflowTaskUsers ? 'taskUsersList' : 'usersList';
        this[key] = [...data];
      }
    });
  }

  /**
   * @param id id
   * Function to get workgroup's statistics
   */
  getWorkgroupDetailStatistic = (id: number): void => {
    this.groupService.getWorkgroupDetailStatistic(id).subscribe(res => {
      if (res) {
        this.groupName = res.group_name as string;
        this.headerDetails = {
          lowPriority: res.low || 0,
          mediumPriority: res.med || 0,
          highPriority: res.high || 0,
          totalTasks: res.all_task || 0,
          completedTasks: res.completed_task || 0,
          notCompletedTasks: res.all_task - res.completed_task,
        };
        this.showPieChart();
        this.showPieChart1();
      }
    });
  }

  /**
   * Function to get completed percentage
   */
  completePercent(): number {
    if (this.headerDetails && Object.keys(this.headerDetails).length && this.headerDetails.hasOwnProperty('completedTasks')) {
      const percent = !this.headerDetails.completedTasks ? 0
        : Math.ceil((this.headerDetails.completedTasks / this.headerDetails.totalTasks) * 100);
      return percent;
    }
  }

  /**
   * Function to display pie chart
   */
  showPieChart(): void {
    const arr = [
      {
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#485CC7', '#D4D8F2'] : ['#f8f8fd'],
        labels: this.headerDetails.totalTasks > 0 ? ['Completed', 'Incompleted'] : [''],
        data: this.headerDetails.totalTasks > 0
          ? [this.headerDetails.completedTasks, this.headerDetails.notCompletedTasks] : [100],
        id: 'chart1',
        fontSize: 9,
        isTooltip: this.headerDetails.totalTasks > 0 ? true : false
      },
    ];
    this.chartProperties = [...arr];
  }

  /**
   * Function to display pie-chart in list
   */
  showPieChart1(): void {
    const arr = [
      {
        backgroundColor: this.headerDetails.totalTasks > 0 ? ['#e74c3c', '#FFFF00', '#00ff00'] : ['#f8f8fd'],
        labels: this.headerDetails.totalTasks > 0 ? ['High Priority', 'Medium Priority', 'Low Priority'] : [100],
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
   * Function to navigate to groups page
   */
  backToGroups = () => {
    this.router.navigate(['main/groups']);
  }

  /**
   * Function to load horizintal bar chart
   */
  loadChart = () => {
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: [],
        datasets: [{
          data: [50, 50, 50, 50, 50],
          backgroundColor: 'rgba(63,103,126,0)',
          hoverBackgroundColor: 'rgba(50,90,100,0)',
          // borderWidth: 1
        }, {
          data: [100, 100, 100, 100, 100],
          backgroundColor: ['#F73B22', '#485CC7', '#33C12E', '#F73B22', '#485CC7'],
          // borderWidth: 1,
        }]
      },
      options: this.barOptionsStacked,
      borderWidth: 1
    });

    // this part to make the tooltip only active on your real dataset
    const originalGetElementAtEvent = myChart.getElementAtEvent;
    myChart.getElementAtEvent = function () {
      // tslint:disable-next-line:only-arrow-functions
      return originalGetElementAtEvent.apply(this, arguments).filter(function (e: any) {
        return e._datasetIndex === 1;
      });
    };
  }

  /**
   * Function to navigate to project detail page
   * @param id id
   */
  goToProjectDetail(id: number): void {
    this.router.navigate(['/main/projects/' + id]);
  }

  /**
   * Function to change view between Gantt View and List View
   * @param isChecked Checkbox change event
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
   * Function to draw gantt chart
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
          // start = new Date(moment().format('YYYY,MM,DD'));
        }
        if (obj.task.due_date) {
          end = new Date(moment(obj.task.due_date).format('YYYY,MM,DD'));
        } else {
          end = new Date(moment().format('YYYY,MM,DD'));
        }
        data.addRows([
          [`${taskId}`, `${taskName}`, `${resource}`, start, end, null, percentComplete, dependancy],
        ]);
      });

      const options = {
        height: (this.arrTasks.length * 45) > 350 ? 350 : (this.arrTasks.length * 45),
        legend: { position: 'top', maxLines: 10 },
        bar: { groupWidth: '50%' },
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
              barLabel.title = tempData[i].task.name;
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
              barLabel.style.left = (rectangles[i].getBBox().x + rectangles[i].getBBox().width + containerBounds.left) + 'px';
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
   * Function to navigate to task detail page
   * @param index index
   */
  redirectToDetail = (index: number) => {
    const data = this.arrTasks[index];
    if (data) {
      this.router.navigate(['main/projects/tasks/', data.task.id]);
    }
  }

  /**
   * Function to set project per page record
   * @param perPage perPage
   */
  setProjectPerPage = (perPage) => {
    window.scroll(0, 0);
    this.projDefaultParams.limit = perPage;
    this.projDefaultParams.offset = 0;
    this.listGroupProjects();
  }

  /**
   * Function to set workflow per page record
   * @param perPage perPage
   */
  setWorkflowPerPage = (perPage) => {
    window.scroll(0, 0);
    this.workflowDefaultParams.limit = perPage;
    this.workflowDefaultParams.offset = 0;
    this.listGroupWorkflows();
  }

  /**
   * Function to set task per page record
   * @param perPage perPage
   */
  setTaskPerPage = (perPage) => {
    window.scroll(0, 0);
    this.taskDefaultParams.limit = perPage;
    this.taskDefaultParams.offset = 0;
    this.listGroupTasks();
  }
}
