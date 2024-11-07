export interface ITask {
  id: number;
  rank: number;
  task: Task;
  total_favorite_task: number;
  is_favorite: boolean;
}

interface Task {
  assigned_to_users: Array<IAssignedToUsers>;
  attachments: Array<IAttachments>;
  created_at: string;
  due_date: string;
  id: number;
  importance: number;
  name: string;
  status: number;
  start_date: string;
  completed_percentage: number;
  prior_task: number;
  after_task: number;
  assigned_to: IAssignedToUsers;
}

interface IAssignedToUsers {
  id: number;
  first_name: string;
  last_name: string;
  user_avatar_thumb: string;
}

interface IAttachments {
  id: string;
  document_name: string;
  document: string;
}
