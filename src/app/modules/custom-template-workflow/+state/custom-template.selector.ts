import {createFeatureSelector, createSelector} from '@ngrx/store';

import {customTemplateAdaptor, CustomTemplatePartialState, CUSTOM_TEMPLATE_STATE, State} from './custom-template.reducer';

export const getCustomTemplateState = createFeatureSelector<CustomTemplatePartialState, State>(CUSTOM_TEMPLATE_STATE);

export const { selectAll } = customTemplateAdaptor.getSelectors();

export const getTemplateName = createSelector(
  getCustomTemplateState,
  state => state.title
);

export const getWorkflow = createSelector(
  getCustomTemplateState,
  state => state.workflow
);

export const getCustomField = createSelector(
  getCustomTemplateState,
  state => state.customFields
);

export const getTask = createSelector(
  getCustomTemplateState,
  state => state.tasks
);

export const getTemplatePreview = createSelector(
  getCustomTemplateState,
  state => state
);

export const getCustomTemplate = createSelector(
  getCustomTemplateState,
  state => state.customTemplate
);