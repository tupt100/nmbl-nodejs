import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import * as customFieldActions from './custom-field.actions';

import {CustomField, Task} from '../custom-field-model';

export const CUSTOM_FIELD_STATE = 'CustomField';

export interface State extends EntityState<any> {
  title: string;
  task: Task,
  dueDate: string,
  startDate: string,
  customFields: CustomField[],
  customField: CustomField
}

export interface CustomFieldPartialState {
  [CUSTOM_FIELD_STATE]: State
}

export const customFieldAdaptor = createEntityAdapter();

export const initialState = customFieldAdaptor.getInitialState({
  title: '',
  task: {},
  dueDate: '',
  startDate: '',
  customFields: [],
  customField: {}
})

const customFieldReducer = createReducer(
  initialState,
  on(
    customFieldActions.createCustomFields,
    (state: State, {customFields}) => ({...state, customFields})
  ),
  on(
    customFieldActions.getCustomFieldInfoSuccessfully,
    (state: State, {customField}) => ({...state, customField})
  ),
  on(
    customFieldActions.resetCustomFieldInfo,
    (state: State) => ({
      ...state,
      title: '',
      task: {},
      dueDate: '',
      startDate: '',
      customFields: [],
      customField: {}
    })
  )
)

export function reducer(state, action) {
  return customFieldReducer(state, action);
}
