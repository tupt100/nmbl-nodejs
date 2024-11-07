import { Action } from '@ngrx/store';
export const SAVE = '[Data] load data';
export const SAVE_SUCCESS = '[Data] successfully loaded data';
export const SAVE_FAILURE = '[Data] failed to load data';

export class SaveDataAction implements Action {
  readonly type = SAVE;
  constructor(public payload: any) { }
}

export class SaveDataFailedAction implements Action {
  readonly type = SAVE_FAILURE;

  constructor() {
  }
}

export class SaveDataSuccessAction implements Action {
  readonly type = SAVE_SUCCESS;
  constructor(public payload: any) {
  }
}

export type DataActions = SaveDataAction | SaveDataFailedAction | SaveDataSuccessAction;
