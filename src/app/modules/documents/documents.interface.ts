export interface IDocument {
  created_at: string;
  created_by: {
    first_name: string;
    id: number;
    last_name: string;
    user_avatar_thumb: string;
  };
  document: string;
  document_name: string;
  document_tags: Array<{ id: number, tag: string }>;
  id: number;
  uploaded_to: {
    id: number;
    importance: number;
    is_private: boolean;
    name: string;
  };
}

export interface IWorkflow {
  attachments: Array<IAttachments>;
  id: number;
  name: string;
  task: Array<any>;
}

export interface ITask {
  attachments: Array<IAttachments>;
  id: number;
  name: string;
}

export interface IAttachments {
  document: string;
  document_name: string;
  id: string;
}
