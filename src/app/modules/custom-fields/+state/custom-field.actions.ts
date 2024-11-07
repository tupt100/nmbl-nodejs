import { createAction, props } from '@ngrx/store';

import { CustomField } from '../custom-field-model';

const spacer = '[Custom Field]';

export const createCustomFields = createAction(
  spacer + 'create custom fields',
  props<{ customFields: CustomField[] }>()
);

export const getCustomFieldInfo = createAction(
  spacer + 'get Custom Field Info',
  props<{ id: number }>()
);

export const getCustomFieldInfoSuccessfully = createAction(
  spacer + 'create Custom Field',
  props<{ customField: CustomField }>()
);

export const getCustomFieldInfoFailed = createAction(
  spacer + 'create Custom Field',
  props<{ reason: string }>()
);

export const resetCustomFieldInfo = createAction(
  spacer + 'reset Custom Field Info',
  props<{}>()
);
