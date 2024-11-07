export interface ProductivityReport {
  FROM: string;
  TO: string;
  NEW: number;
  COMPLETED: number;
  CATEGORY: string;
  TEAM_MEMBER: string;
  GROUP: string;
}

export interface Prodductivity {
  active: number;
  complete: number;
  team_member: {
    first_name: string;
    id: number;
    last_name: string;
  };
}

export interface ProdductivityGraph {
  created_on: string;
  project: number;
  task: number;
  workflow: number;
}

export interface EfficiencyReport {
  FROM: string;
  TO: string;
  CREATED_ON: string;
  COMPLETED_ON: string;
  AVG_TIME: string;
  CATEGORY: string;
  NAME: string;
  TEAM_MEMBER: string;
}

export interface Efficiency {
  project_avg: number;
  workflow_avg: number;
  task_avg: number;
  team_member: {
    first_name: string;
    id: number;
    last_name: string;
  };
}

export interface WorkloadReport {
  FROM: string;
  TO: string;
  CATEGORY: string;
  OPEN: number;
  TEAMMEMBER: string;
}

export interface Workload {
  project: number;
  workflow: number;
  task: number;
  total: number;
  team_member: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface GroupWorkloadReport {
  FROM: string;
  TO: string;
  CATEGORY: string;
  GROUP: string;
  OPEN: number;
  COMPLETED: number;
}

export interface GroupWorkloadActive {
  open_project: number;
  open_task: number;
  open_workflow: number;
  total: number;
  work_group_name: string;
}

export interface GroupWorkloadComplete {
  completed_project: number;
  completed_task: number;
  completed_workflow: number;
  total: number;
  work_group_name: string;
}

export interface PrivilegeReport {
  FROM: string;
  TO: string;
  CATEGORY: string;
  NAME: string;
  PRIVILEGE: string;
  TEAMMEMBER: string;
}

export interface TagsReport {
  FROM: string;
  TO: string;
  CATEGORY: string;
  TAGS: string;
  OPEN: number;
  COMPLETED: number;
}

export interface TagActive {
  open_project: number;
  open_task: number;
  open_workflow: number;
  tag_name: string;
  total: number;
}

export interface TagComplete {
  completed_project: number;
  completed_task: number;
  completed_workflow: number;
  tag_name: string;
  total: number;
}

export const stackedBarChartOptions = {
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      fontFamily: 'stolzl regular',
    }
  },
  scales: {
    xAxes: [{
      stacked: true,
      gridLines: { display: false },
      ticks: {
        fontStyle: 'bold',
        maxTicksLimit: 10
      }
    }],
    yAxes: [{
      stacked: true,
      ticks: {
        fontStyle: 'bold'
      }
    }]
  }
};
