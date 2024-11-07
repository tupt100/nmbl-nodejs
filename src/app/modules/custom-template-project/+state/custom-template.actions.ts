import { createAction, props } from '@ngrx/store';

import { CustomField, CustomTemplate, Task, Workflow } from '../custom-template-model';

const spacer = '[Custom Project Template] ';

export const createLabel = createAction(
  spacer + 'create Label',
  props<{ title: string }>()
);

export const createWorkflowField = createAction(
  spacer + 'create Workflow Details',
  props<{ workflow: Workflow }>()
)

export const createCustomFields = createAction(
  spacer + 'create custom fields',
  props<{ customFields: CustomField[] }>()
);

export const createTasks = createAction(
  spacer + 'create tasks',
  props<{ tasks: Task[] }>()
);

export const getTemplateWorkflowInfo = createAction(
  spacer + 'get Template Info',
  props<{ id: number }>()
);

export const getTemplateWorkflowInfoSuccessfully = createAction(
  spacer + 'create Task Template',
  props<{ customTemplate: CustomTemplate }>()
);

export const getTemplateInfoFailed = createAction(
  spacer + 'create Task Template',
  props<{ reason: string }>()
);

export const resetTemplateInfo = createAction(
  spacer + 'reset Template Info',
  props<{}>()
);
