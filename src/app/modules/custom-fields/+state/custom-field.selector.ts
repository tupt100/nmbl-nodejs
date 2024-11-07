import {createFeatureSelector, createSelector} from '@ngrx/store';

import {customFieldAdaptor, CustomFieldPartialState, CUSTOM_FIELD_STATE, State} from './custom-field.reducer';

export const getCustomTemplateState = createFeatureSelector<CustomFieldPartialState, State>(CUSTOM_FIELD_STATE);

export const { selectAll } = customFieldAdaptor.getSelectors();

export const getCustomFields = createSelector(
  getCustomTemplateState,
  state => state.customFields
);

export const getCustomField = createSelector(
  getCustomTemplateState,
  state => state.customField
);
