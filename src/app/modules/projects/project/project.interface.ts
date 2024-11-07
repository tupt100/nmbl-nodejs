export interface IProject {
  id: number;
  project: Project;
  rank: number;
}

interface Project {
  assigned_to_users: Array<AssignedToUsers>;
  attachments: Array<Attachments>;
  due_date: string;
  id: number;
  importance: number;
  name: string;
  owner: {
    first_name: string;
    id: number;
    last_name: string;
  };
  task: {
    completed_task: number;
    passed_due: number;
    total_task: number;
  };
  workflow: Array<Workflow>;

}

interface AssignedToUsers {
  id: number;
  first_name: string;
  last_name: string;
  user_avatar_thumb: string;
}

interface Attachments {
  id: string;
  document_name: string;
  document: string;
}

interface Workflow {
  attachments: Array<Attachments>;
  id: number;
  name: string;
  task: any;
}
