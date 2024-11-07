import * as datas from '../actions/permission.action';

interface IDatas {
  count: number;
  next: string;
  previous: string;
  permission: any;
  results: Array<{ model_type: string, permission_slug: string }>;
}

export interface PermissionState {
  loaded: boolean;
  loading: boolean;
  datas: IDatas;
}

const initialState: PermissionState = {
  loaded: false,
  loading: false,
  datas: { count: 0, next: null, permission: {}, previous: null, results: [] },
};

export function reducer(state = initialState, action: datas.PermissionActions): PermissionState {
  switch (action.type) {

    case datas.SAVE_PERMISSION: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_PERMISSION_SUCCESS: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_PERMISSION_FAILURE: {
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: [],
      });
    }

    default:
      return state;
  }
}
/*
 Selectors for the state that will be later
 used in the games-list component
 */
export const getPermission = (state: PermissionState) => state.datas;
export const getLoadingState = (state: PermissionState) => state.loading;



