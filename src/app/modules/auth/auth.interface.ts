export interface ISignUp {
  token?: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface ILogin {
  username: string;
  password: string;
}

export interface IUser {
  company: string;
  email: string;
  first_name: string;
  group: IUserGroup;
  id: number;
  is_owner: boolean;
  last_name: string;
  title: string;
  token: string;
  user_avatar: string;
  username: string;
}


interface IUserGroup {
  id: number;
  name: string;
  is_user_specific: boolean;
  is_public: boolean;
  is_company_admin: boolean;
}

