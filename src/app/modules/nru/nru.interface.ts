export interface IRequest {
  assigned_to: string;
  id: number;
  status: string;
  subject: string;
}

export class CurrentRequest {
  id: number;
  // tslint:disable-next-line:variable-name
  service_desk_request: number;
  task: {
    assigned_to: string;
    assigned_to_group: Array<string>;
    attachments: Array<any>;
    description: string;
    due_date: string;
    importance: number;
    name: string;
    servicedeskrequest_details: {
      service_desk_request: {
        id: number;
      },
      servicedeskuser: {
        user_email: string;
        user_name: string;
      }
    };
    status: number;
  };
}
