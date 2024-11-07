import * as datas from '../actions/save.action';

interface IDatas {
  count: number;
  next: string;
  previous: string;
  permission: any;
  results: Array<{ model_type: string, permission_slug: string }>;
}

export interface SaveDataState {
  loaded: boolean;
  loading: boolean;
  datas: IDatas;
}

const initialState: SaveDataState = {
  loaded: false,
  loading: false,
  datas: { count: 0, next: null, permission: {}, previous: null, results: [] },
};

export function reducer(state = initialState, action: datas.DataActions): SaveDataState {
  switch (action.type) {

    case datas.SAVE: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_SUCCESS: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_FAILURE: {
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
export const getDatas = (state: SaveDataState) => state.datas;
export const getLoadingState = (state: SaveDataState) => state.loading;
