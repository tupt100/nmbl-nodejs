export interface IUserProfile {
  email: string;
  first_name: string;
  group: IGroup;
  has_request_permission: boolean;
  id: number;
  is_owner: boolean;
  last_name: string;
  title: string;
  user_avatar: string;
}

interface IGroup {
  is_company_admin: boolean;
  name: string;
}
