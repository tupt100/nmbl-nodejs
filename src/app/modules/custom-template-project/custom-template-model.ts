import * as moment from 'moment';

export class CustomField {
  projectTemplateId: number;
  id: number;
  label: string;
  fieldType: string;
  defaultValue: string;
  isRequired: boolean;
  description: string;
  deleted: boolean;

  constructor(obj: any) {
    this.label = obj['label'] ?? '';
    this.fieldType = obj['field_type'] ?? obj['fieldType'] ?? '';
    this.defaultValue = obj['default_value'] ?? obj['defaultValue'] ?? '';
    this.isRequired = obj['is_required'] ?? obj['isRequired'] ?? '';
    this.projectTemplateId = obj['project_template_id'] ?? obj['projectTemplateId'] ?? '';
    this.id = obj['pk'] ?? obj['id'];
    this.deleted = obj['deleted'] ?? false;
    this.description = obj['description'] ?? '';
  }
}

export class CustomFieldOutputModel {
  object_id?: number;
  pk: number;
  label: string;
  field_type: string;
  default_value: string;
  is_required: boolean;
  description: string;

  constructor(obj: any) {
    this.label = obj['label'];
    this.field_type = obj['fieldType'];
    this.default_value = obj['defaultValue'];
    this.is_required = obj['isRequired'];
    this.object_id = obj['workflowTemplateId'];
    this.description = obj['description'];
    this.pk = obj['id'];
  }
}

export class TaskOutputModel {
  importance: string;
  name: string;
  assigned_to_group: number[];
  assigned_to_users: number;
  project_template_id: number;
  due_date: number;
  start_date: number;
  description: string;
  is_private: boolean;
  attorney_client_privilege: boolean;
  work_product_privilege: boolean;
  confidential_privilege: boolean;
  attachments: any[];
  constructor(obj) {
    this.importance = importanceLevel[obj.importance];
    this.assigned_to_group = obj.group?.length ? obj.group.map(g => g.id) : [];
    this.name = obj.workflowName ?? '';
    this.assigned_to_users = obj.user?.length ? obj.user.map(u => u.id) : [];
    this.project_template_id = obj.project_template_id ?? '';
    this.due_date = obj.dueDate;
    this.start_date = obj.startDate;
    this.is_private = obj.isPrivate ?? '';
    this.description = obj.description ?? '';
    this.attorney_client_privilege = obj.privileges.filter(p => p.id === 'attorney_client_privilege')[0].checked ?? false;
    this.work_product_privilege = obj.privileges.filter(p => p.id === 'work_product_privilege')[0].checked ?? false;
    this.confidential_privilege = obj.privileges.filter(p => p.id === 'confidential_privilege')[0].checked ?? false;
    this.attachments = obj.attachments?.length ? obj.attachments : [];
  }
}

const importance = { 1: 'low', 2: 'medium', 3: 'high' };

export enum importanceLevel { low = 1, medium = 2, high = 3 }

const privileges = {
  attorney_client_privilege: 'Attorney Client',
  work_product_privilege: 'Work Product',
  confidential_privilege: 'Confidential'
}

export class Task {
  id: number;
  workflowName: string;
  importance: string;
  description: string;
  user: any[];
  project: any[];
  group: any[];
  isPrivate: boolean;
  privileges: any[];
  startDate: number;
  dueDate: number;
  fromOutOfPage: Boolean;
  deleted?: Boolean;
  constructor(obj: any) {
    this.id = obj.id || obj.pk;
    this.workflowName = obj.workflowName ?? (obj['workflow_name'] || obj['name']);
    this.importance = importance[obj.importance] ?? obj.importance;
    this.description = obj.description ?? '';
    this.project = obj.project ?? obj['project_id'] ?? [];
    this.user = obj.user ?? obj['assigned_to_users'][0] ?? [];
    this.group = obj.group ?? obj['assigned_to_group'];
    this.isPrivate = obj.isPrivate ?? obj['is_private'];
    this.startDate = obj.startDate || obj.start_date;
    this.dueDate = obj.dueDate || obj.due_date;
    this.fromOutOfPage = obj.fromOutOfPage;
    this.privileges = obj.privileges ??
      [
        {
          id: 'attorney_client_privilege',
          title: privileges['attorney_client_privilege'],
          checked: obj['attorney_client_privilege']
        },
        {
          id: 'work_product_privilege',
          title: privileges['work_product_privilege'],
          checked: obj['work_product_privilege']
        },
        {
          id: 'confidential_privilege',
          title: privileges['confidential_privilege'],
          checked: obj['confidential_privilege']
        }];
    this.deleted = obj['deleted'] ?? false;
  }
}

export class Workflow {
  name: string;
  importance: string;
  description: string;
  user: any[];
  group: any[];
  isPrivate: boolean;
  privileges: any[];
  startDate: number;
  dueDate: number;
  fromOutOfPage: Boolean;
  constructor(obj: any) {
    this.name = obj.name ?? obj['project_name'];
    this.importance = importance[obj.importance] ?? obj.importance;
    this.description = obj.description ?? '';
    this.user = obj.user ?? obj['assigned_to_users'][0]?.id ?? [];
    this.group = obj.group ?? obj['assigned_to_group']?.map(g => g.id) ?? [];
    this.isPrivate = obj.isPrivate ?? obj['is_private'];
    this.startDate = obj.startDate || obj.start_date;
    this.dueDate = obj.dueDate || obj.due_date;
    this.fromOutOfPage = obj.fromOutOfPage;
    this.privileges = obj.privileges ??
      [
        {
          id: 'attorney_client_privilege',
          title: privileges['attorney_client_privilege'],
          checked: obj['attorney_client_privilege']
        },
        {
          id: 'work_product_privilege',
          title: privileges['work_product_privilege'],
          checked: obj['work_product_privilege']
        },
        {
          id: 'confidential_privilege',
          title: privileges['confidential_privilege'],
          checked: obj['confidential_privilege']
        }
      ];
  }
}

export class CustomTemplate {
  createdById: number;
  fields: CustomField[];
  workflows: any[];
  isActive: boolean;
  id: number;
  title: string;
  project: Workflow;

  constructor(obj: any) {
    this.createdById = obj['created_by_id'];
    this.fields = (obj.custom_fields || obj.customfield_set).map(item => new CustomField(item));
    this.workflows = obj.workflow_fixtures;
    this.isActive = obj['is_active'];
    this.id = obj['pk'];
    this.title = obj['title'];
    this.project = new Workflow(obj);
  }
}

export class CustomWorkflowTemplateOutputModel {
  title: string;
  importance: string;
  name: string;
  assigned_to_group_id: number[];
  assigned_to_users_id: number[];
  due_date: number;
  start_date: number;
  description: string;
  is_private: boolean;
  attorney_client_privilege: boolean;
  work_product_privilege: boolean;
  confidential_privilege: boolean;
  customfield_set: CustomFieldOutputModel[];
  custom_fields?: any[];
  constructor(obj) {
    this.title = obj.title ?? '';
    this.importance = importanceLevel[obj.importance];
    this.assigned_to_group_id = obj.group ?? '';
    this.name = obj.name ?? '';
    this.assigned_to_users_id = obj.user.length === 0 ? [] : [obj.user];
    this.due_date = obj.dueDate;
    this.start_date = obj.startDate;
    this.is_private = obj.isPrivate ?? '';
    this.description = obj.description ?? '';
    this.attorney_client_privilege = obj.privileges.filter(p => p.id === 'attorney_client_privilege')[0].checked ?? false;
    this.work_product_privilege = obj.privileges.filter(p => p.id === 'work_product_privilege')[0].checked ?? false;
    this.confidential_privilege = obj.privileges.filter(p => p.id === 'confidential_privilege')[0].checked ?? false;
    this.custom_fields = obj.custom_fields ?? [];
  }
}
