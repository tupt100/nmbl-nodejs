
import { Action } from '@ngrx/store';
export const SAVE_FEATURES = '[Data] Features load data';
export const SAVE_FEATURES_SUCCESS = '[Data] Features successfully loaded data';
export const SAVE_FEATURES_FAILURE = '[Data] Features failed to load data';

export class SaveFeatures implements Action {
  readonly type = SAVE_FEATURES;
  constructor(public payload: any) { }
}

export class SaveFeaturesFailedAction implements Action {
  readonly type = SAVE_FEATURES_FAILURE;

  constructor() {
  }
}

export class SaveFeaturesSuccessAction implements Action {
  readonly type = SAVE_FEATURES_SUCCESS;
  constructor(public payload: any) {
  }
}

export type FeaturesActions = SaveFeatures | SaveFeaturesFailedAction | SaveFeaturesSuccessAction;