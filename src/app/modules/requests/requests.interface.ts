export class IRequest {
  // tslint:disable-next-line:variable-name
  assigned_to: null;
  attachments: Array<Attachments>;
  description: string;
  id: number;
  // tslint:disable-next-line:variable-name
  request_priority: number;
  // tslint:disable-next-line:variable-name
  requested_due_date: string;
  subject: string;
  // tslint:disable-next-line:variable-name
  user_information: {
    user_email: string;
    user_name: string;
    user_phone_number: string;
    title: string;
  };
}

interface Attachments {
  attachment_name: string;
  attachment_url: string;
  id: string;
}

export interface IPrivilege {
  id: string;
  title: string;
}

export interface IUsers {
  first_name: string;
  id: number;
  last_name: string;
  user_avatar_thumb: string;
}
