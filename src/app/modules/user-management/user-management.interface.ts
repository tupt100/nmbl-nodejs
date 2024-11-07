export interface IUsers {
  first_name: string;
  group: IGroup;
  id: number;
  is_owner: boolean;
  last_name: string;
  title: string;
  checked: boolean;
  work_group: Array<WorkGroup>;
}

interface IGroup {
  id: number;
  name: string;
}

export interface WorkGroup {
  id: number;
  name: string;
}

export interface IPendingUsers {
  email: string;
  first_name: string;
  id: number;
  invited_by_group: number;
  last_name: string;
}

export interface IBulkInvite {
  email: string;
  first_name?: string;
  last_name?: string;
  invited_by_group: number;
}

export interface IGroups {
  id: number;
  is_public: boolean;
  is_user_specific: boolean;
  name: string;
  project_permissions: Array<IPermissions>;
  request_permissions: Array<IPermissions>;
  task_permissions: Array<IPermissions>;
  workflow_permissions: Array<IPermissions>;
  checked: boolean;
}

export interface IPermissions {
  id: number;
  name: string;
  slug: string;
}

export interface IWorkGroup {
  id: number;
  name: string;
  users_count: number;
  group_members: null;
  project: null;
  workflow: null;
  task: {
    completed_task: number;
    overdue_task: number;
    total_task: number;
  };
}

export interface IPermissionManager {
  can_be_delete: boolean;
  has_project_permissions: number;
  has_task_permissions: number;
  has_workflow_permissions: number;
  id: number;
  name: string;
  total_project_permissions: number;
  total_task_permissions: number;
  total_workflow_permissions: number;
  user_details: Array<IUserDetails>;
  users_count: number;
}

export interface IUserDetails {
  first_name: string;
  id: number;
  last_name: string;
  title: string;
}

export interface INotifications {
  email_notification: boolean;
  id: number;
  in_app_notification: boolean;
  name: string;
}

export interface IGroupDetails {
  first_name: string;
  id: number;
  last_name: string;
  user_avatar_thumb: string;
}
