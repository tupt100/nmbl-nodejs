export interface IWorkflow {
  id: number;
  rank: number;
  workflow: Iworkflow;
  project: any;
  custom_fields?: Array<any>;
}

interface Iworkflow {
  assigned_to_users: Array<IAssignedTo>;
  assigned_to_group: Array<IAssignedToGroup>;
  completed_task: number;
  due_date: string;
  id: number;
  importance: string;
  name: string;
  owner: {
    first_name: string;
    id: number;
    last_name: string;
    user_avatar_thumb: string;
  };
  total_task: number;
  workflow_tags: Array<number>;
  start_date: string;
  status?: string;
  is_private?: string;
  template_id?: number;
  custom_fields_value?: Array<any>;
  global_custom_fields?: Array<any>;
}

interface IAssignedToGroup {
  id: number;
  name: string;
}

interface Iattachments {
  id: string;
  document_name: string;
  document: string;
}

export interface ITask {
  id: number;
  rank: number;
  task: Itask;
}

interface Itask {
  assigned_to: IAssignedTo;
  attachments: Array<Iattachments>;
  created_at: string;
  due_date: string;
  id: number;
  importance: number;
  name: string;
  status: number;
  prior_task: number;
  after_task: number;
  start_date: string;
  completed_percentage: number;
}

export interface IAssignedTo {
  first_name: string;
  id: number;
  last_name: string;
  user_avatar_thumb: string;
}
