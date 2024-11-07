import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Chart } from 'chart.js';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import * as moment from 'moment';
import * as html2pdf from 'html2pdf.js';

import { ngxCsv } from 'ngx-csv/ngx-csv';
import { ReportingService } from '../reporting.service';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import {
  ProductivityReport,
  EfficiencyReport,
  WorkloadReport,
  GroupWorkloadReport,
  PrivilegeReport,
  TagsReport,
  Prodductivity,
  ProdductivityGraph,
  Efficiency,
  Workload,
  GroupWorkloadActive,
  GroupWorkloadComplete,
  TagActive,
  TagComplete,
  stackedBarChartOptions
} from '../reporting.interface';
import { Messages } from 'src/app/services/messages';

import { API_BASE_URL } from '../../../config/web.config';

@Component({
  selector: 'app-report-mgmt',
  templateUrl: './report-mgmt.component.html',
  styleUrls: ['./report-mgmt.component.scss']
})
export class ReportMgmtComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private reportService: ReportingService,
    private exportAsService: ExportAsService
  ) { }

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public isReset = false;
  public reportType = '';
  public reportName = '';
  public categoryFilter = 'project,workflow,task';
  public privilegeFilter = 'Attorney Client,Work Product,Confidential';
  public teamFilter = '';
  public groupFilter = '';
  public tagsFilter = '';
  public dateFrom = '';
  public dateTo = '';
  public CsvConfigConsts = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: false,
    useBom: true,
    noDownload: false,
    title: '',
    headers: []
  };
  public arrProductivity: Array<ProductivityReport> = [];
  public arrEfficiency: Array<EfficiencyReport> = [];
  public arrWorkload: Array<WorkloadReport> = [];
  public arrGroupWorkload: Array<GroupWorkloadReport> = [];
  public arrPrivilege: Array<PrivilegeReport> = [];
  public arrTags: Array<TagsReport> = [];
  public listProductivity: Array<Prodductivity> = [];
  public listProductivityReport: Array<ProdductivityGraph> = [];
  public listEfficiency: Array<Efficiency> = [];
  public listWorkload: Array<Workload> = [];
  public listGroupWorkloadActive: Array<GroupWorkloadActive> = [];
  public listGroupWorkloadComplete: Array<GroupWorkloadComplete> = [];
  public listTagActive: Array<TagActive> = [];
  public listTagComplete: Array<TagComplete> = [];
  public listPrivilege: Array<PrivilegeReport> = [];
  public FileReportView = false;
  public showModal = {
    isDownloadReport: false
  };
  public prodNew = true;
  public prodCompleted = true;
  public prodTotal = true;
  public effProject = true;
  public effWorkflow = true;
  public effTask = true;
  public workflowProject = true;
  public workflowWorkflow = true;
  public workflowTask = true;
  public workflowTotal = true;
  public groupWorkflowProject = true;
  public groupWorkflowWorkflow = true;
  public groupWorkflowTask = true;
  public groupWorkflowTotal = true;
  public tagProject = true;
  public tagWorkflow = true;
  public tagTask = true;
  public tagTotal = true;
  exportAsConfig: ExportAsConfig = {
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

  ngOnInit() {
    // Set report type from query params
    this.route.queryParams.subscribe(params => {
      this.reportName = params.type || '';
      this.reportType = params.type || '';
    });

    // Set start and end date for current month
    this.dateFrom = moment().startOf('month').format('YYYY-MM-DD');
    this.dateTo = moment().endOf('month').format('YYYY-MM-DD');
  }

  /**
   * Trigger when report type selected
   * @param reportType Report type
   */
  onSelectReport = (reportType: string) => {
    this.listProductivity = [];
    this.listEfficiency = [];
    this.listWorkload = [];
    this.listGroupWorkloadActive = [];
    this.listGroupWorkloadComplete = [];
    this.listPrivilege = [];
    this.listTagActive = [];
    this.listTagComplete = [];

    this.reportType = reportType;
    this.location.replaceState('/main/report-mgmt?type=' + reportType);
  }

  /**
   * Trigger when team member selected
   * @param member Selected team member
   */
  onSelectMember = (member: string) => {
    this.teamFilter = member;
  }

  /**
   * Trigger when group selected
   * @param group Selected group
   */
  onSelectGroup = (group: string) => {
    this.groupFilter = group;
  }

  /**
   * Trigger when date-range-picker changes dates
   * @param date Start and end date
   */
  onSelectDate = (date: any) => {
    this.dateFrom = date.start;
    this.dateTo = date.end;
  }

  /**
   * Trigger when category selected
   * @param category Selected category
   */
  onSelectCategory = (category: string) => {
    if (category === 'All') {
      this.categoryFilter = 'project,workflow,task';
    } else if (category) {
      this.categoryFilter = category.toLowerCase();
    }
  }

  /**
   * Trigger when privilege selected
   * @param privilege Selected privilege
   */
  onSelectPrivilege = (privilege: string) => {
    if (privilege === 'All') {
      this.privilegeFilter = 'Attorney Client,Work Product,Confidential';
    } else {
      this.privilegeFilter = privilege;
    }
  }

  /**
   * Trigger when tag selected
   * @param tag Selected tag
   */
  onSelectTag = (tag: string) => {
    if (tag) {
      this.tagsFilter = tag.toLowerCase();
    } else {
      this.tagsFilter = '';
    }
  }

  /**
   * Method to generate csv file of productivity report
   */
  getProductivityReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'NEW', 'COMPLETED', 'CATEGORY', 'TEAM_MEMBER', 'GROUP'];
    this.reportService.productivity_file_generate(
      this.categoryFilter, this.teamFilter, this.groupFilter, this.dateFrom, this.dateTo
    ).subscribe(res => {
      if (res && res.length) {
        this.arrProductivity = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            NEW: obj.active || 0,
            COMPLETED: obj.completed || 0,
            CATEGORY: obj.category_type || '',
            TEAM_MEMBER: `${obj.team_member.first_name} ${obj.team_member.last_name}` || '',
            GROUP: obj.group || '',
          };
          this.arrProductivity.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrProductivity, 'Productivity Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.productivityNotFound);
      }
    });
  }

  /**
   * Method to display of productivity report
   */
  generateProductivityReport = () => {
    this.reportService.generateProductivityReport(
      this.categoryFilter,
      this.teamFilter,
      this.groupFilter,
      this.dateFrom,
      this.dateTo
    ).subscribe((res: Array<Prodductivity>) => {
      if (res) {
        this.listProductivity = res;
      }
    });
  }

  /**
   * Method to generate productivity graph
   */
  generateProductivityGraph = () => {
    this.reportService.generateProductivityGraph(
      this.categoryFilter,
      this.teamFilter,
      this.groupFilter,
      this.dateFrom,
      this.dateTo
    ).subscribe((res: Array<ProdductivityGraph>) => {
      if (res) {
        const labels: Array<string> = [];
        const projects: Array<number> = [];
        const workflows: Array<number> = [];
        const tasks: Array<number> = [];
        this.listProductivityReport = res;
        this.listProductivityReport.map((obj: any) => {
          const dateFrom = moment(this.dateFrom).format('M');
          const dateTo = moment(this.dateTo).format('M');
          if (dateFrom === dateTo) {
            labels.push(obj.created_on);
          } else {
            const month = moment(obj.created_on).format('MMM');
            if (labels.length === 0 || labels.indexOf(month) === -1) {
              labels.push(month);
            } else {
              labels.push('');
            }
          }
          projects.push(obj.project);
          workflows.push(obj.workflow);
          tasks.push(obj.task);
        });

        setTimeout(() => {
          if (labels.length && projects.length && workflows.length && tasks.length) {
            this.displayLineChart('lineChart', labels, projects, workflows, tasks);
          }
        }, 1000);
      }
    });
  }

  /**
   * Method to filter productivity report by new and completed P/W/T
   */
  filterProductivity = (response: string) => {
    const data: Array<string> = response.split(',');
    if (data && data.length) {
      this.prodNew = true;
      this.prodCompleted = true;
      this.prodTotal = true;
      if (data.indexOf('New PWT') === -1) {
        this.prodNew = false;
        this.prodTotal = false;
      }
      if (data.indexOf('Completed PWT') === -1) {
        this.prodCompleted = false;
        this.prodTotal = false;
      }
      if (data.indexOf('Show All') !== -1) {
        this.prodNew = true;
        this.prodCompleted = true;
        this.prodTotal = true;
      }
    }
  }

  /**
   * Method to reset productivity report
   */
  resetProductivityReport = () => {
    this.listProductivity = [];
    this.isReset = true;
    this.reset();
  }

  /**
   * Method to generate csv file of efficiency report.
   */
  getEfficiencyReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'CREATED ON', 'COMPLETED ON', 'AVG TIME(days)', 'CATEGORY', 'NAME', 'TEAM_MEMBER'];
    this.reportService.efficiency_file_generate(this.teamFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res && res.length) {
        this.arrEfficiency = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CREATED_ON: obj.created_on ? moment(obj.created_on).format('MM/DD/YYYY') : '',
            COMPLETED_ON: obj.completed_on ? moment(obj.completed_on).format('MM/DD/YYYY') : '',
            AVG_TIME: obj.completion_time,
            CATEGORY: obj.category_type,
            NAME: obj.name,
            TEAM_MEMBER: obj.team_member,
          };
          this.arrEfficiency.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrEfficiency, 'Efficiency Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.efficiencyNotFound);
      }
    });
  }

  /**
   * Method to display of efficiency report.
   */
  generateEfficiencyReport = (download?: boolean) => {
    this.reportService.generateEfficiencyReport(this.teamFilter, this.dateFrom, this.dateTo).subscribe((res: Array<Efficiency>) => {
      if (res) {
        const labels: Array<string> = [];
        const projects: Array<string> = [];
        const workflows: Array<string> = [];
        const tasks: Array<string> = [];
        this.listEfficiency = res;
        if (this.listEfficiency && this.listEfficiency.length) {
          this.listEfficiency.map(obj => {
            labels.push(`${obj.team_member.first_name} ${obj.team_member.last_name.charAt(0)}.`);
            projects.push(`${obj.project_avg}`);
            workflows.push(`${obj.workflow_avg}`);
            tasks.push(`${obj.task_avg}`);
          });

          setTimeout(() => {
            this.displayStackedBarChart('barChart', labels, projects, workflows, tasks);
            if (download) {
              this.download();
            }
          }, 1000);
        }
      }
    });
  }

  /**
   * Method to filter efficiency report by P/W/T
   */
  filterEfficiency = (response: string) => {
    const data: Array<string> = response.split(',');
    if (data && data.length) {
      this.effProject = true;
      this.effWorkflow = true;
      this.effTask = true;
      if (data.indexOf('Project') === -1) {
        this.effProject = false;
      }
      if (data.indexOf('Workflow') === -1) {
        this.effWorkflow = false;
      }
      if (data.indexOf('Task') === -1) {
        this.effTask = false;
      }
      if (data.indexOf('All') !== -1) {
        this.effProject = true;
        this.effWorkflow = true;
        this.effTask = true;
      }
    }
  }

  /**
   * Method to reset efficiency report
   */
  resetEfficiencyReport = () => {
    this.listEfficiency = [];
    this.isReset = true;
    this.reset();
  }

  /**
   * Method to generate csv file of workload report.
   */
  getWorkloadReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'CATEGORY', 'OPEN', 'TEAM MEMBER'];
    this.reportService.team_member_workload_file_generate(this.teamFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res && res.length) {
        this.arrWorkload = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CATEGORY: obj.category_type,
            OPEN: obj.total_count,
            TEAMMEMBER: `${obj.team_member.first_name} ${obj.team_member.last_name}`
          };
          this.arrWorkload.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrWorkload, 'Workload Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.workloadNotFound);
      }
    });
  }

  /**
   * Method to display of workload report.
   */
  generateWorkloadReport = (download?: boolean) => {
    this.reportService.generateWorkloadReport(this.teamFilter, this.dateFrom, this.dateTo).subscribe((res: Array<Workload>) => {
      if (res && res.length) {
        this.listWorkload = res;
        if (this.listWorkload && this.listWorkload.length) {
          setTimeout(() => {
            this.listWorkload.map((obj, index) => {
              if (index < 5) {
                const name = `${obj.team_member.first_name} ${obj.team_member.last_name.charAt(0)}.`;
                this.displayDoughnutGraph(`pieChart-${index}`, name, `${obj.project}`, `${obj.workflow}`, `${obj.task}`);
              }
            });
            if (download) {
              this.download();
            }
          }, 1000);
        }
      }
    });
  }

  /**
   * Method to filter workload report by P/W/T
   */
  filterWorkflow = (response: string) => {
    const data: Array<string> = response.split(',');
    if (data && data.length) {
      this.workflowProject = true;
      this.workflowWorkflow = true;
      this.workflowTask = true;
      this.workflowTotal = true;
      if (data.indexOf('Project') === -1) {
        this.workflowProject = false;
        this.workflowTotal = false;
      }
      if (data.indexOf('Workflow') === -1) {
        this.workflowWorkflow = false;
        this.workflowTotal = false;
      }
      if (data.indexOf('Task') === -1) {
        this.workflowTask = false;
        this.workflowTotal = false;
      }
      if (data.indexOf('All') !== -1) {
        this.workflowProject = true;
        this.workflowWorkflow = true;
        this.workflowTask = true;
        this.workflowTotal = true;
      }
    }
  }

  /**
   * Method to reset workload report
   */
  resetWorkloadReport = () => {
    this.listWorkload = [];
    this.isReset = true;
    this.reset();
  }

  /**
   * Method to generate CSV file of group workload report.
   */
  getGroupWorkloadReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'CATEGORY', 'GROUP', 'OPEN', 'COMPLETED'];
    this.reportService.group_workload_file_generate(this.categoryFilter, this.groupFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res && res.length) {
        this.arrGroupWorkload = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CATEGORY: obj.category_type,
            GROUP: obj.work_group_name,
            OPEN: obj.active,
            COMPLETED: obj.complete
          };
          this.arrGroupWorkload.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrGroupWorkload, 'Group Workload Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.groupWorkloadNotFound);
      }
    });
  }

  /**
   * Method to display of group workload report.
   */
  generateGroupWorkloadReport = (download?: boolean) => {
    this.reportService.generateGroupWorkloadReport(this.categoryFilter, this.groupFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res) {
        const activeHeaders: Array<string> = [];
        const activeProjects: Array<string> = [];
        const activeWorkflows: Array<string> = [];
        const activeTasks: Array<string> = [];
        this.listGroupWorkloadActive = res.active;
        if (this.listGroupWorkloadActive && this.listGroupWorkloadActive.length) {
          this.listGroupWorkloadActive.map(obj => {
            activeHeaders.push(`${obj.work_group_name}`);
            activeProjects.push(`${obj.open_project}`);
            activeWorkflows.push(`${obj.open_workflow}`);
            activeTasks.push(`${obj.open_task}`);
          });
        }
        setTimeout(() => {
          this.displayStackedBarChart('barChart', activeHeaders, activeProjects, activeWorkflows, activeTasks);
        }, 1000);

        const completedHeaders: Array<string> = [];
        const completedProjects: Array<string> = [];
        const completedWorkflows: Array<string> = [];
        const completedTasks: Array<string> = [];
        this.listGroupWorkloadComplete = res.complete;
        if (this.listGroupWorkloadComplete && this.listGroupWorkloadComplete.length) {
          this.listGroupWorkloadComplete.map(obj => {
            completedHeaders.push(`${obj.work_group_name}`);
            completedProjects.push(`${obj.completed_project}`);
            completedWorkflows.push(`${obj.completed_workflow}`);
            completedTasks.push(`${obj.completed_task}`);
          });
        }
        setTimeout(() => {
          this.displayStackedBarChart('barChart1', completedHeaders, completedProjects, completedWorkflows, completedTasks);
          if (download) {
            this.download();
          }
        }, 1000);
      }
    });
  }

  /**
   * Method to filter group workload report by p/w/t
   */
  filterGroupWorkflow = (response: string) => {
    const data: Array<string> = response.split(',');
    if (data && data.length) {
      this.groupWorkflowProject = true;
      this.groupWorkflowWorkflow = true;
      this.groupWorkflowTask = true;
      this.groupWorkflowTotal = true;
      if (data.indexOf('Project') === -1) {
        this.groupWorkflowProject = false;
        this.groupWorkflowTotal = false;
      }
      if (data.indexOf('Workflow') === -1) {
        this.groupWorkflowWorkflow = false;
        this.groupWorkflowTotal = false;
      }
      if (data.indexOf('Task') === -1) {
        this.groupWorkflowTask = false;
        this.groupWorkflowTotal = false;
      }
      if (data.indexOf('All') !== -1) {
        this.groupWorkflowProject = true;
        this.groupWorkflowWorkflow = true;
        this.groupWorkflowTask = true;
        this.groupWorkflowTotal = true;
      }
    }
  }

  /**
   * Method to reset group workload report
   */
  resetGroupWorkloadReport = () => {
    this.listGroupWorkloadActive = [];
    this.listGroupWorkloadComplete = [];
    this.isReset = true;
    this.reset();
  }

  /**
   * Method to generate csv file of privilege report.
   */
  getPrivilegeLogReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'CATEGORY', 'NAME', 'PRIVILEGE', 'TEAM MEMBER'];
    this.reportService.getPrivilegeLogReport(
      this.privilegeFilter,
      this.categoryFilter,
      this.teamFilter,
      this.dateFrom,
      this.dateTo
    ).subscribe(res => {
      if (res && res.length) {
        this.arrPrivilege = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CATEGORY: obj.CATEGORY,
            NAME: obj.NAME,
            PRIVILEGE: obj.PRIVILEGE,
            TEAMMEMBER: obj['TEAM MEMBER']
          };
          this.arrPrivilege.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrPrivilege, 'Privilege Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.privilegeNotFound);
      }
    });
  }

  /**
   * Method to display of privilege report.
   */
  generatePrivilegeReport = (download?: boolean) => {
    this.reportService.getPrivilegeLogReport(
      this.privilegeFilter,
      this.categoryFilter,
      this.teamFilter,
      this.dateFrom,
      this.dateTo
    ).subscribe(res => {
      if (res && res.length) {
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CATEGORY: obj.CATEGORY,
            NAME: obj.NAME,
            PRIVILEGE: obj.PRIVILEGE,
            TEAMMEMBER: obj['TEAM MEMBER']
          };
          this.listPrivilege.push(params);
        });
        if (download) {
          this.download();
        }
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.privilegeNotFound);
      }
    });
  }

  /**
   * Method to reset privilege report
   */
  resetPrivilegeReport = () => {
    this.isReset = true;
    this.reset();
  }

  /**
   * Method to generate csv file of tag report.
   */
  getTagReport = () => {
    this.CsvConfigConsts.headers = ['FROM', 'TO', 'CATEGORY', 'TAG', 'OPEN', 'COMPLETED'];
    this.reportService.tag_report_file_generate(this.tagsFilter, this.categoryFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res && res.length) {
        this.arrTags = [];
        res.map(obj => {
          const params = {
            FROM: moment(this.dateFrom).format('MM/DD/YYYY'),
            TO: moment(this.dateTo).format('MM/DD/YYYY'),
            CATEGORY: obj.category_type,
            TAGS: obj.tag_name,
            OPEN: obj.active,
            COMPLETED: obj.complete
          };
          this.arrTags.push(params);
        });
        // tslint:disable-next-line:no-unused-expression
        new ngxCsv(this.arrTags, 'Tag Report', this.CsvConfigConsts);
      } else {
        this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.tagNotFound);
      }
    });
  }

  /**
   * Method to display of tag report.
   */
  generateTagReport = (download?: boolean) => {
    if (this.tagsFilter === '' && this.tagsFilter.trim().length === 0) {
      this.notifier.displayErrorMsg(Messages.notifier.reportMgmt.filterTag);
      window.scroll(0, 0);
      return;
    }
    this.reportService.generateTagsReportReport(this.tagsFilter, this.categoryFilter, this.dateFrom, this.dateTo).subscribe(res => {
      if (res) {
        const activeHeaders: Array<string> = [];
        const activeProjects: Array<string> = [];
        const activeWorkflows: Array<string> = [];
        const activeTasks: Array<string> = [];
        this.listTagActive = res.active as Array<TagActive>;
        this.listTagComplete = res.complete as Array<TagComplete>;
        if (this.listTagActive && this.listTagActive.length) {
          this.listTagActive.map(obj => {
            activeHeaders.push(`${obj.tag_name}`);
            activeProjects.push(`${obj.open_project}`);
            activeWorkflows.push(`${obj.open_workflow}`);
            activeTasks.push(`${obj.open_task}`);
          });
        }
        setTimeout(() => {
          this.displayStackedBarChart('barChart', activeHeaders, activeProjects, activeWorkflows, activeTasks);
          if (download) {
            this.download();
          }
        }, 1000);
      }
    });
  }

  /**
   * Method to filter tag report by P/W/T
   */
  filterTag = (response: string) => {
    const data: Array<string> = response.split(',');
    if (data && data.length) {
      this.tagProject = true;
      this.tagWorkflow = true;
      this.tagTask = true;
      this.tagTotal = true;
      if (data.indexOf('Project') === -1) {
        this.tagProject = false;
        this.tagTotal = false;
      }
      if (data.indexOf('Workflow') === -1) {
        this.tagWorkflow = false;
        this.tagTotal = false;
      }
      if (data.indexOf('Task') === -1) {
        this.tagTask = false;
        this.tagTotal = false;
      }
      if (data.indexOf('All') !== -1) {
        this.tagProject = true;
        this.tagWorkflow = true;
        this.tagTask = true;
        this.tagTotal = true;
      }
    }
  }

  /**
   * Method to reset tag report
   */
  resetTagReport = () => {
    this.isReset = true;
    this.reset();
  }

  /**
   * Trigger when reset any report
   */
  reset = () => {
    setTimeout(() => {
      this.isReset = false;
    }, 500);
  }

  /**
   * Render stacked bar chart
   * @param element HTML element
   * @param labels Labels on graph
   * @param projects Project array
   * @param workflows Workflow array
   * @param tasks Tasks array
   */
  displayStackedBarChart = (element, labels, projects, workflows, tasks) => {

    // tslint:disable-next-line:no-unused-expression
    new Chart(document.getElementById(element), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Project',
            data: projects,
            backgroundColor: '#2B3777',
            hoverBorderWidth: 0
          },
          {
            label: 'Workflow',
            data: workflows,
            backgroundColor: '#485CC7',
            hoverBorderWidth: 0
          },
          {
            label: 'Task',
            data: tasks,
            backgroundColor: '#A1ACE7',
            hoverBorderWidth: 0
          }
        ]
      },
      options: stackedBarChartOptions
    });
  }

  /**
   * Render doughnut chart
   * @param element HTML element
   * @param labels Labels on graph
   * @param projects Project array
   * @param workflows Workflow array
   * @param tasks Tasks array
   */
  displayDoughnutGraph = (element, name, project, workflow, task) => {
    const totalTasks = (parseInt(project, 10) + parseInt(workflow, 10) + parseInt(task, 10));
    // tslint:disable-next-line:no-unused-expression
    new Chart(document.getElementById(element), {
      type: 'doughnut',
      data: {
        // labels: ['Project', 'Workflow', 'Task'],
        datasets: [
          {
            backgroundColor: ['#2B3777', '#485CC7', '#A1ACE7'],
            data: [project, workflow, task]
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
        beforeDraw(chart, options) {
          const width = chart.chart.width;
          const height = chart.chart.height;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '28px stolzl regular';
          ctx.textBaseline = 'middle';
          const text = `${totalTasks}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 - 15;
          ctx.fillText(text, textX, textY);
          ctx.save();
        },
        afterDraw(chart, options) {
          const width = chart.chart.width;
          const height = chart.chart.height;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '12px stolzl regular';
          ctx.textBaseline = 'middle';
          const text = `${name}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 + 10;

          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      }]
    });
  }

  /**
   * Render line chart
   * @param element HTML element
   * @param labels Labels on graph
   * @param projects Project array
   * @param workflows Workflow array
   * @param tasks Tasks array
   */
  displayLineChart = (element, labels, projects, workflows, tasks) => {
    // tslint:disable-next-line:no-unused-expression
    new Chart(document.getElementById(element), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Project',
            fill: false,
            borderColor: '#2B3777',
            data: projects
          },
          {
            label: 'Workflow',
            fill: false,
            borderColor: '#485CC7',
            data: workflows
          },
          {
            label: 'Task',
            fill: false,
            borderColor: '#A1ACE7',
            data: tasks
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontFamily: 'stolzl regular'
          }
        },
      }
    });
  }

  /**
   * Close popup
   */
  onClose = (response) => {
    if (!response) {
      this.showModal.isDownloadReport = false;
    }
  }

  /**
   * Open download report popup
   */
  download = () => {
    this.showModal.isDownloadReport = true;
  }

  /**
   * Set report view Landscape or Protrait
   * @param res Selected report view
   */
  mode = (res) => {
    this.FileReportView = res === 'Landscape' ? true : false;
  }

  /**
   * Trigger download report as CSV functions
   * @param type Report Type
   */
  downloadCSVReport(type): void {
    if (type === 'TagsReport') {
      return this.getTagReport();
    } else {
      const functionName = `get${type}Report`;
      return this[functionName]();
    }
  }

  /**
   * Trigger report download (CSV, PDF and HTML)
   */
  onDownload = (response) => {
    html2pdf().set({
      pagebreak: {
        before: '',
        after: ['.rrow-item', '.card'],
        avoid: '.ritem', mode: 'legacy'
      }
    });
    const type = this.reportType.replace(/\s/g, '');
    const reportName = `${type}-${moment(this.dateFrom).format('YYYY-MM-DD')}_${moment(this.dateTo).format('YYYY-MM-DD')}`;
    const divID = `rpt${type}`;
    switch (response.type) {
      case 'PDF':
        this.exportAsConfig.elementId = divID;
        this.exportAsConfig.options.jsPDF.orientation = response.mode === 'Portrait' ? 'portrait' : 'landscape';
        this.exportAsService.save(this.exportAsConfig, reportName).subscribe();
        break;
      case 'CSV':
        this.downloadCSVReport(type);
        break;
      case 'HTML':
        this.generateHTML(type);
        break;
    }

    this.FileReportView = false;
    this.showModal.isDownloadReport = false;
  }

  /**
   * Method to generate report in HTML.
   */
  generateHTML = (type) => {
    const reportName = `${type}-${moment(this.dateFrom).format('YYYY-MM-DD')}_${moment(this.dateTo).format('YYYY-MM-DD')}`;
    let dynamicDiv = '';
    let dynamicDiv1 = '';
    let headerDiv = '';
    let dataURL = '';
    let dataURL1 = '';
    let headText = '';
    let subheadText = '';
    let sub1 = '';
    let sub2 = '';
    let aside = 'Average Time (Hours)';
    let main = 'Average Time (Hours)';
    if (this.listProductivity.length) {
      // HEADER
      headerDiv += '<div class="rhead">TEAM MEMBERS</div>';
      headerDiv += '<div class="rhead">NEW PWT</div>';
      headerDiv += '<div class="rhead">COMPLETED PWT </div>';
      headerDiv += '<div class="rhead"></div>';
      // ITEM
      this.listProductivity.map(obj => {
        let completed = 0;
        if (+obj.active > +obj.complete) {
          completed = +obj.active - +obj.complete;
        } else if (+obj.active < +obj.complete) {
          completed = 0;
        } else if (+obj.active === +obj.complete) {
          completed = 0;
        }
        dynamicDiv += '<div class="rrow rrow-item">';
        dynamicDiv += '<div class="ritem">';
        dynamicDiv += '<div class="m-0 profile-wrap">';
        dynamicDiv += '<span class="no-img">' + `${obj.team_member.first_name.charAt(0)}${obj.team_member.last_name.charAt(0)}` + '</span>';
        dynamicDiv += '<p> ' + `${obj.team_member.first_name} ${obj.team_member.last_name}` + ' </p>';
        dynamicDiv += '</div>';
        dynamicDiv += '</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.active}` + ' hours</div>';
        dynamicDiv += '<div class="ritem">  ' + `${obj.complete}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + completed + ' hours</div>';
        dynamicDiv += '</div>';
      });

      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', 'CanvasAsImage.png');
      const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
      dataURL = canvas.toDataURL('image/png');
      headText = 'Productivity Report:';
      subheadText = 'New VS Completed Tasks';

    } else if (this.listEfficiency.length) {
      // HEADER
      headerDiv += '<div class="rhead">TEAM MEMBERS</div>';
      headerDiv += '<div class="rhead">PROJECTS</div>';
      headerDiv += '<div class="rhead">WORKFLOWS</div>';
      headerDiv += '<div class="rhead">TASKS</div>';
      // ITEM
      this.listEfficiency.map(obj => {
        dynamicDiv += '<div class="rrow rrow-item">';
        dynamicDiv += '<div class="ritem">';
        dynamicDiv += '<div class="m-0 profile-wrap">';
        dynamicDiv += '<span class="no-img">' + `${obj.team_member.first_name.charAt(0)}${obj.team_member.last_name.charAt(0)}` + '</span>';
        dynamicDiv += '<p> ' + `${obj.team_member.first_name} ${obj.team_member.last_name}` + ' </p>';
        dynamicDiv += '</div>';
        dynamicDiv += '</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.project_avg}` + ' hours</div>';
        dynamicDiv += '<div class="ritem">  ' + `${obj.workflow_avg}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.task_avg}` + ' hours</div>';
        dynamicDiv += '</div>';
      });
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', 'CanvasAsImage.png');
      const canvas = document.getElementById('barChart') as HTMLCanvasElement;
      dataURL = canvas.toDataURL('image/png');
      headText = 'Efficiency Report:';
      subheadText = 'Average time from creation to completion';

    } else if (this.listWorkload.length) {
      // HEADER
      headerDiv += '<div class="rhead">TEAM MEMBERS</div>';
      headerDiv += '<div class="rhead">PROJECTS</div>';
      headerDiv += '<div class="rhead">WORKFLOWS</div>';
      headerDiv += '<div class="rhead">TASKS</div>';
      headerDiv += '<div class="rhead">ToTAL</div>';
      // ITEM
      this.listWorkload.map(obj => {
        dynamicDiv += '<div class="rrow rrow-item">';
        dynamicDiv += '<div class="ritem">';
        dynamicDiv += '<div class="m-0 profile-wrap">';
        dynamicDiv += '<span class="no-img">' + `${obj.team_member.first_name.charAt(0)}${obj.team_member.last_name.charAt(0)}` + '</span>';
        dynamicDiv += '<p> ' + `${obj.team_member.first_name} ${obj.team_member.last_name}` + ' </p>';
        dynamicDiv += '</div>';
        dynamicDiv += '</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.project}` + ' hours</div>';
        dynamicDiv += '<div class="ritem">  ' + `${obj.workflow}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.task}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.total}` + ' hours</div>';
        dynamicDiv += '</div>';
      });
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', 'CanvasAsImage.png');
      const canvas = document.getElementById('pieChart-0') as HTMLCanvasElement;
      dataURL = canvas.toDataURL('image/png');
      headText = 'Workload Report:';
      subheadText = 'Total Number of Tasks, Projects and Workflows';
    } else if (this.listGroupWorkloadActive.length || this.listGroupWorkloadComplete.length) {
      // HEADER
      headerDiv += '<div class="rhead">GROUPS</div>';
      headerDiv += '<div class="rhead">PROJECTS</div>';
      headerDiv += '<div class="rhead">WORKFLOWS</div>';
      headerDiv += '<div class="rhead">TASKS</div>';
      headerDiv += '<div class="rhead">ToTAL</div>';
      // ITEM
      this.listGroupWorkloadActive.map(obj => {
        dynamicDiv += '<div class="rrow rrow-item">';
        dynamicDiv += '<div class="ritem">';
        dynamicDiv += '<div class="m-0 profile-wrap">';
        dynamicDiv += '<p> ' + `${obj.work_group_name}` + ' </p>';
        dynamicDiv += '</div>';
        dynamicDiv += '</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.open_project}` + ' hours</div>';
        dynamicDiv += '<div class="ritem">  ' + `${obj.open_workflow}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.open_task}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.total}` + ' hours</div>';
        dynamicDiv += '</div>';
      });
      // ITEM
      this.listGroupWorkloadComplete.map(obj => {
        dynamicDiv1 += '<div class="rrow rrow-item">';
        dynamicDiv1 += '<div class="ritem">';
        dynamicDiv1 += '<div class="m-0 profile-wrap">';
        dynamicDiv1 += '<p> ' + `${obj.work_group_name}` + ' </p>';
        dynamicDiv1 += '</div>';
        dynamicDiv1 += '</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.completed_project}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem">  ' + `${obj.completed_workflow}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.completed_task}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.total}` + ' hours</div>';
        dynamicDiv1 += '</div>';
      });

      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', 'CanvasAsImage.png');
      const canvas = document.getElementById('barChart') as HTMLCanvasElement;
      dataURL = canvas.toDataURL('image/png');

      const downloadLink1 = document.createElement('a');
      downloadLink1.setAttribute('download', 'CanvasAsImage.png');
      const canvas1 = document.getElementById('barChart1') as HTMLCanvasElement;
      dataURL1 = canvas1.toDataURL('image/png');

      headText = 'Group Workload Report:';
      subheadText = ' Total Number of Open Tasks, Workflows, and/or Projects VS Completed by Group';
      sub1 = '';
      sub2 = '';
    } else if (this.listTagActive.length || this.listTagComplete.length) {
      // HEADER
      headerDiv += '<div class="rhead">TAG(S)</div>';
      headerDiv += '<div class="rhead">PROJECTS</div>';
      headerDiv += '<div class="rhead">WORKFLOWS</div>';
      headerDiv += '<div class="rhead">TASKS</div>';
      headerDiv += '<div class="rhead">ToTAL</div>';
      // ITEM
      this.listTagActive.map(obj => {
        dynamicDiv += '<div class="rrow rrow-item">';
        dynamicDiv += '<div class="ritem">';
        dynamicDiv += '<div class="m-0 profile-wrap">';
        dynamicDiv += '<p> ' + `${obj.tag_name}` + ' </p>';
        dynamicDiv += '</div>';
        dynamicDiv += '</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.open_project}` + ' hours</div>';
        dynamicDiv += '<div class="ritem">  ' + `${obj.open_workflow}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.open_task}` + ' hours</div>';
        dynamicDiv += '<div class="ritem"> ' + `${obj.total}` + ' hours</div>';
        dynamicDiv += '</div>';
      });

      // ITEM
      this.listTagComplete.map(obj => {
        dynamicDiv1 += '<div class="rrow rrow-item">';
        dynamicDiv1 += '<div class="ritem">';
        dynamicDiv1 += '<div class="m-0 profile-wrap">';
        dynamicDiv1 += '<p> ' + `${obj.tag_name}` + ' </p>';
        dynamicDiv1 += '</div>';
        dynamicDiv1 += '</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.completed_project}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem">  ' + `${obj.completed_workflow}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.completed_task}` + ' hours</div>';
        dynamicDiv1 += '<div class="ritem"> ' + `${obj.total}` + ' hours</div>';
        dynamicDiv1 += '</div>';
      });

      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('download', 'CanvasAsImage.png');
      const canvas = document.getElementById('barChart') as HTMLCanvasElement;
      dataURL = canvas.toDataURL('image/png');
      headText = 'Tags Report:';
      subheadText = 'View Open VS Completed Tasks, Workflows and Projects for one or more tags.';
      sub1 = '1. Open P/W/T';
      sub2 = '2. Completed P/W/T';
      aside = 'Open P/W/T';
      main = 'Tags';
    }

    let div = '<html>';
    div += '<head>';
    div += '<link href="https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap" rel="stylesheet"/>';
    div += '<style type="text/css">';
    div += 'body {font-family: Roboto, sans-serif; }';
    div += '.header { width: 100%; text-align: left;}';
    div += '.container {max-width: 1200px; width: 100%; padding-left: 15px; padding-right: 15px; margin: 0 auto;}';
    div += '.rtype-head { color:black; font-size: 14px; font-weight: 500; line-height: 20px; display: block; margin-top: 10px;}';
    // tslint:disable-next-line:max-line-length
    div += '.rtable .rrow-head { display: flex; align-items: stretch; justify-content: space-between; cursor: pointer; border-bottom: 1px solid rgba(224, 224, 224, 0.4); min-height: 45px; background-color: rgba(255,255,255,1); text-transform: uppercase; color: rgba(21, 31, 43, 0.6); font-family: Roboto, sans-serif;  padding: 10px 10px; font-size: 12px; font-weight: 300; text-transform: uppercase;}';
    // tslint:disable-next-line:max-line-length
    div += '.rtable .rrow.rrow-head .rhead { margin: 0; padding: 5px 10px; display: -moz-flex; display: -ms-flex; display: -o-flex;display: flex; -ms-align-items: center; align-items: center; -moz-justify-content: flex-start; -ms-justify-content: flex-start;-o-justify-content: flex-start; justify-content: flex-start; position: relative; max-width: 150px;width: 20%;}';
    div += '.rtable .rrow.rrow-head .rhead:first-child { width: 30%; max-width: 170px;}';
    // tslint:disable-next-line:max-line-length
    div += '.rtable .rrow.rrow-item { display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: center; align-items: center; -moz-justify-content: space-between;-ms-justify-content: space-between;-o-justify-content: space-between; justify-content: space-between; border: none; background-color: rgba(72, 92, 199, 0.05); width: 100%; padding: 10px 10px; position: relative; color: rgba(21, 27, 59, 0.6); font-size: 12px; transition: all 0.3s ease; border-radius: 3px 3px 0 0; margin-bottom: 5px;color: rgba(21, 31, 43, 1);}';
    // tslint:disable-next-line:max-line-length
    div += '.rtable .rrow.rrow-item .ritem { font-size: 13px;line-height: 18px; display: flex; padding: 0 15px; justify-content: flex-start; align-items: center; text-align: left; margin: 0; max-width: 150px; width: 20%; word-wrap: break-word; white-space: normal; word-break: break-word;}';
    div += '.rtable .rrow.rrow-item .ritem:first-child { color: rgba(72, 92, 199, 1); width: 30%; max-width: 160px;}';
    div += '.rtable .rrow.rrow-item .ritem .profile-wrap { width: 100%; }';
    div += '.rwrap .rcol {  margin: 0; flex: 1; }';
    div += '.rwrap .rcol:first-child { padding-right: 22px; }';
    div += '.rwrap .rcol:last-child { padding-left: 22px; }';
    // tslint:disable-next-line:max-line-length
    div += '.rwrap .rcol .fitem-check input.fitem-ck-input ~ .fitem-ck-txt { font-size: 12px; } .rwrap .rcol .fitem-check input.fitem-ck-input ~ .fitem-ck-txt:before { width: 16px; height: 16px; } .rwrap .rcol .fitem-check input.fitem-ck-input ~ .fitem-ck-txt:after { width: 6px; height: 9px; left: 7px; top: 4px; } .rwrap .rcol .print-mode { margin: 0; flex: 1; } .rwrap .rcol .print-mode .pmode { background-color: rgba(216, 216, 216, 0.5); height: 100px; display: block; margin: 20px 0 10px; } .rwrap .rcol .print-mode .pmode.portrait { width: 80px; } .rwrap .rcol .print-mode .pmode.landscape { width: 160px; } .rwrap .rcol .file-format { margin-top: 50px; } .rwrap .rcol .file-format figure { height: 30px; width: 30px; margin: 10px 10px 10px 0; } .rwrap .rcol .file-format figure img { height: 100%; width: 100%; object-fit: cover; } .rwrap .rcol.rpreview img { border: 3px solid rgba(216, 216, 216, 0.5); margin: 20px auto; } .card.flex-col { display: flex; flex-direction: column; justify-content: space-between; } .card.flex-col .card-title { width: 100%; } .card.flex-col .card-body { flex: 1; width: 100%; } .card.flex-col .card-ftr { width: 100%; margin: 0; } .reporting-wraps .info-block .card { width: 100%; } .card .card-title { padding: 15px 20px; margin-bottom: 10px;} .card .card-title .flex { align-items: flex-start; } .flex, .multiselect-text .badge.flex { display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: flex-start; align-items: flex-start; -moz-justify-content: space-between; -ms-justify-content: space-between; -o-justify-content: space-between;justify-content: space-between;    flex-direction: column; }.reporting-wraps .info-block .card-title h5 { flex: 1; } .card .card-title .flex h5 { margin: 0; word-wrap: break-word; } h5 { font-size: 16px; line-height: 23px; font-weight: 400; } h1, h2, h3, h4, h5, h6 { margin-bottom: 20px; font-family: Roboto, sans-serif; font-weight: 500; font-weight: 500; color: rgba(0, 0, 0, 0.8); }.card .card-title .flex .right-cap-area { margin: 0; padding: 0; padding-left: 10px; }.reporting-wraps .info-block .right-cap-area { flex: 1; max-width: 200px; } .pos-relative { position: relative; } .flex-end { display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; justify-content: flex-end; -o-justify-content: flex-end; }';
    div += '.card { max-width: 1200px; width: 100%; padding-left: 15px; padding-right: 15px;margin: 0 auto; }';
    // tslint:disable-next-line:max-line-length
    div += '.aside-area { display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -moz-justify-content: space-between; -ms-justify-content: space-between; -o-justify-content: space-between; justify-content: space-between; -ms-align-items: flex-start; align-items: flex-start; width: 100%; position: relative; padding-top: 20px;}';
    div += '.reporting-wraps.aside-area aside .card-full-height { min-height: calc(100vh - 120px);}';
    div += '.reporting-wraps .fitem .dwrap { position: relative;  margin-top: 15px;}';
    div += ' input .reporting-wraps .fitem .fitem-check.fitem-ck-input ~ .fitem-ck-txt { font-size: 13px; margin-bottom: 15px;}';
    div += ' input .reporting-wraps .fitem .fitem-check.fitem-ck-input ~ .fitem-ck-txt:before { width: 16px; height: 16px;}';
    // tslint:disable-next-line:max-line-length
    div += ' input .reporting-wraps .fitem .fitem-check.fitem-ck-input ~ .fitem-ck-txt:after { width: 5px; height: 10px; left: 8px; top: 4px;}';
    div += '.reporting-wraps .nav-dropdown { margin-top: 7px; }';
    // tslint:disable-next-line:max-line-length
    div += '.reporting-wraps .select-box { padding: 8px 35px 8px 15px; font-family: Roboto, sans-serif; font-size: 13px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}';
    div += '.reporting-wraps .drop-down  font-family: Roboto, sans-serif;; font-size: 13px;}';
    div += '.reporting-wraps .daterangepicker.lg-field { padding: 0; }';
    div += '.reporting-wraps .daterangepicker .sm-text { display: none; }';
    // tslint:disable-next-line:max-line-length
    div += '.reporting-wraps.landscape .info-block { display: -moz-flex; display: -ms-flex; display: -o-flex; display: flex; -ms-align-items: flex-start;align-items: flex-start;-moz-justify-content: space-between;-ms-justify-content: space-between;-o-justify-content: space-between;justify-content: space-between;flex-direction: row;}';
    div += '.reporting-wraps.landscape .card { flex: 1; max-width: 50%; margin: 5px;}';
    div += '.reporting-wraps.landscape .card:first-child { margin-right: 5px; }';
    div += '.reporting-wraps.landscape .card:last-child { margin-left: 5px; }';
    div += '.reporting-wraps.landscape aside, .reporting-wraps.landscape .right-cap-area { display: none; }';
    div += '.reporting-wraps button[type="button"].no-btn:hover, .reporting-wraps button[type="button"]';
    div += '.reporting-wraps .info-block .card { width: 100%; padding:0; }';
    div += '.reporting-wraps .info-block .card-title h5 { flex: 1; }';
    div += '.reporting-wraps .info-block .right-cap-area { flex: 1; max-width: 200px; }';
    div += '.reporting-wraps .info-block .right-cap-area > .no-btn { display: flex; align-items: center; }';
    div += '.reporting-wraps .info-block .right-cap-area > .no-btn img { margin-left: 5px; padding: 4px 0; }';
    div += '.reporting-wraps .rpie { max-width: 50%; height: auto; flex: 1; overflow: visible; margin: 0 0 15px;}';
    div += '.reporting-wraps .rlabel {  position: relative; padding-left: 50px;display: inline-block; }';
    // tslint:disable-next-line:max-line-length
    div += '.reporting-wraps .rlabel .y-axis-label {  position: absolute; left: -50px; transform: rotate(-90deg); line-height: 0; top: 40%; opacity: 0.6;}';
    div += '.reporting-wraps .rlabel .x-axis-label { display: block; text-align: center; opacity: 0.6; margin-top: 20px;}';
    // tslint:disable-next-line:max-line-length
    div += 'main {width: 100%;}.profile-wrap .no-img { height: 30px; width: 30px; display: flex; justify-content: center; align-items: center; border: 3px solid rgba(72, 92, 199, 0.5); border-radius: 100%; color: rgb(72,92,199); font-family: "Roboto"; background: rgb(255,255,255); text-transform: uppercase;}.profile-wrap p {margin: 0;flex: 1; margin-left: 10px; color: rgba(21, 27, 59, 0.6); font-size: 12px; line-height: 17px; font-family: "Roboto";} .profile-wrap {display: flex; align-items: center; width: auto;     justify-content: flex-end;}';
    div += '</style>';
    div += '</head>';
    div += '<body>';
    div += '<div id="wrapper">';
    div += '<div class="content-area">';
    div += '<div class="container"> ';
    div += '<div class="aside-area reporting-wraps">';
    div += '<main>';
    div += '<div class="flex flex-column info-block portrait-report">';
    div += '<div class="header">';
    div += '<div class="header-innerrow">';
    div += '<p>&nbsp;</p>';
    div += `<img height="" width="100" class="m-0" src="${API_BASE_URL}assets/images/dark-proxy.png" />`;
    div += '<h4 class="m-0">' + headText + '</h4>';
    div += '<p> ' + subheadText + '</p>';
    div += '</div>';
    div += '<hr />';
    div += '</div>';
    div += '<div class="card card-tableviewpdf ml-0 mr-0">';

    // BODY
    div += '<div class="card-body">';
    div += '<span _ngcontent-drt-c318="" class="rtype-head">' + sub1 + '</span>';
    div += '<div class="rtable">';
    div += '<div class="rrow rrow-head">';
    div += headerDiv;
    div += '</div>';
    div += dynamicDiv;
    div += '</div>';
    div += '</div>';
    // BODY ENDS
    if (this.listTagComplete.length || this.listGroupWorkloadComplete.length) {
      // BODY
      div += '<div class="card-body">';
      div += '<span _ngcontent-drt-c318="" class="rtype-head">' + sub2 + '</span>';
      div += '<div class="rtable">';
      div += '<div class="rrow rrow-head">';
      div += headerDiv;
      div += '</div>';
      div += dynamicDiv1;
      div += '</div>';
      div += '</div>';
      // BODY ENDS
    }
    div += '</div>';

    // Graph
    div += '<div class="card ml-0 mr-0 page-break">';
    div += '<div class="card-title">';
    div += '<div class="flex"> <h5>Time Frame: ' + this.dateFrom + ' to ' + this.dateTo + ' </h5></div>';
    div += '</div>';
    // Graph - 1
    div += '<div class="card-body rlabel">';
    div += '<span class="y-axis-label">' + aside + '</span>';
    div += '<img src="' + dataURL + '" />';
    div += ' <span class="x-axis-label">' + main + '</span>';
    div += '</div>';
    // Graph - 1 END

    if (this.listGroupWorkloadComplete.length) {
      // Graph - 2
      div += '<div class="card-body rlabel">';
      div += '<span class="y-axis-label">' + aside + '</span>';
      div += '<img src="' + dataURL1 + '" />';
      div += ' <span class="x-axis-label">' + main + '</span>';
      div += '</div>';
      // Graph - 2 END
    }

    div += '</div>';
    div += '</div>';
    div += '</main>';
    div += '</div>';
    div += '</div>';
    div += '</div>';
    div += '</div>';
    div += '</body>';
    div += '</html>';
    const link: any = document.body.appendChild(document.createElement('a'));
    link.download = `${reportName}.html`;
    link.href = 'data:text/html,' + div;
    link.click();
  }
}
