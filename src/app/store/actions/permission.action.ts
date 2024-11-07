import { Action } from '@ngrx/store';
export const SAVE_PERMISSION = '[Data] Permission load data';
export const SAVE_PERMISSION_SUCCESS = '[Data] Permission successfully loaded data';
export const SAVE_PERMISSION_FAILURE = '[Data] Permission failed to load data';

export class SavePermission implements Action {
  readonly type = SAVE_PERMISSION;
  constructor(public payload: any) { }
}

export class SavePermissionFailedAction implements Action {
  readonly type = SAVE_PERMISSION_FAILURE;

  constructor() {
  }
}

export class SavePermissionSuccessAction implements Action {
  readonly type = SAVE_PERMISSION_SUCCESS;
  constructor(public payload: any) {
  }
}

export type PermissionActions = SavePermission | SavePermissionFailedAction | SavePermissionSuccessAction;
