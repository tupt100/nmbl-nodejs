import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import * as customTemplateActions from './custom-template.actions';

import {CustomField, CustomTemplate, Task, Workflow} from '../custom-template-model';

export const CUSTOM_TEMPLATE_STATE = 'CustomProjectTemplate';

export interface State extends EntityState<any> {
  title: string;
  workflow: Workflow,
  dueDate: number,
  startDate: number,
  customFields: CustomField[],
  customTemplate: CustomTemplate,
  tasks: Task[]
}

export interface CustomTemplatePartialState {
  [CUSTOM_TEMPLATE_STATE]: State
}

export const customTemplateAdaptor = createEntityAdapter();

export const initialState = customTemplateAdaptor.getInitialState({
  title: '',
  workflow: {},
  dueDate: null,
  startDate: null,
  customFields: [],
  customTemplate: {},
  tasks: []
})

const customTemplateReducer = createReducer(
  initialState,
  on(
    customTemplateActions.createLabel,
    (state: State, {title}) => ({...state, title})
  ),
  on(
    customTemplateActions.createWorkflowField,
    (state: State, {workflow}) => ({...state, workflow: new Workflow(workflow)})
  ),
  on(
    customTemplateActions.createCustomFields,
    (state: State, {customFields}) => ({...state, customFields})
  ),
  on(
    customTemplateActions.createTasks,
    (state: State, {tasks}) => ({...state, tasks})
  ),
  on(
    customTemplateActions.getTemplateWorkflowInfoSuccessfully,
    (state: State, {customTemplate}) => ({...state, customTemplate})
  ),
  on(
    customTemplateActions.resetTemplateInfo,
    (state: State) => ({
      ...state,
      title: '',
      workflow: {},
      dueDate: null,
      startDate: null,
      customFields: [],
      customTemplate: {},
      tasks: []
    })
  )
)

export function reducer(state, action) {
  return customTemplateReducer(state, action);
}
