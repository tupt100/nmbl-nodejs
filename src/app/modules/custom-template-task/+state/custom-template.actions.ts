import { createAction, props } from '@ngrx/store';

import { CustomField, CustomTemplate, Task } from '../custom-template-model';

const spacer = '[Custom Template] ';

export const createLabel = createAction(
  spacer + 'create Label',
  props<{ title: string }>()
);

export const createTaskField = createAction(
  spacer + 'create Task Details',
  props<{ task: Task }>()
)

export const createCustomFields = createAction(
  spacer + 'create custom fields',
  props<{ customFields: CustomField[] }>()
);

export const getTemplateTaskInfo = createAction(
  spacer + 'get Template Info',
  props<{ id: number }>()
);

export const getTemplateTaskInfoSuccessfully = createAction(
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
