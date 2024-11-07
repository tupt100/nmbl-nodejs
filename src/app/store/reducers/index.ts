import * as fromSaveData from './save.reducer';
import * as fromSavePermission from './permission.reducer';
import * as fromSaveFeatures from './features.reducer';

export interface ErrorState {
  message: string;
  data?: any;
}

export interface AppState {
  permissionlist: fromSavePermission.PermissionState;
  userDetails: fromSaveData.SaveDataState;
  features: fromSaveFeatures.FeatureState
}

export const reducers = {
  permissionlist: fromSavePermission.reducer,
  userDetails: fromSaveData.reducer,
  features: fromSaveFeatures.reducer,
};