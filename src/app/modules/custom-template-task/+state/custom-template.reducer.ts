import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import * as customTemplateActions from './custom-template.actions';

import {CustomField, CustomTemplate, Task} from '../custom-template-model';

export const CUSTOM_TEMPLATE_STATE = 'CustomTemplate';

export interface State extends EntityState<any> {
  title: string;
  task: Task,
  dueDate: number,
  startDate: number,
  customFields: CustomField[],
  customTemplate: CustomTemplate
}

export interface CustomTemplatePartialState {
  [CUSTOM_TEMPLATE_STATE]: State
}

export const customTemplateAdaptor = createEntityAdapter();

export const initialState = customTemplateAdaptor.getInitialState({
  title: '',
  task: {},
  dueDate: null,
  startDate: null,
  customFields: [],
  customTemplate: {}
})

const customTemplateReducer = createReducer(
  initialState,
  on(
    customTemplateActions.createLabel,
    (state: State, {title}) => ({...state, title})
  ),
  on(
    customTemplateActions.createTaskField,
    (state: State, {task}) => ({...state, task: new Task(task)})
  ),
  on(
    customTemplateActions.createCustomFields,
    (state: State, {customFields}) => ({...state, customFields})
  ),
  on(
    customTemplateActions.getTemplateTaskInfoSuccessfully,
    (state: State, {customTemplate}) => ({...state, customTemplate})
  ),
  on(
    customTemplateActions.resetTemplateInfo,
    (state: State) => ({
      ...state,
      title: '',
      task: {},
      dueDate: null,
      startDate: null,
      customFields: [],
      customTemplate: {}
    })
  )
)

export function reducer(state, action) {
  return customTemplateReducer(state, action);
}
