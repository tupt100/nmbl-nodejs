import * as datas from '../actions/features.action';

interface IDatas {
  count: number;
  next: string;
  previous: string;
  features: any;
  results: Array<{ model_type: string, permission_slug: string }>;
}

export interface FeatureState {
  loaded: boolean;
  loading: boolean;
  datas: IDatas;
}

const initialState: FeatureState = {
  loaded: false,
  loading: false,
  datas: { count: 0, next: null, features: {}, previous: null, results: [] },
};

export function reducer(state = initialState, action: datas.FeaturesActions): FeatureState {
  switch (action.type) {

    case datas.SAVE_FEATURES: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_FEATURES_SUCCESS: {
      const page = action.payload;
      return Object.assign({}, state, {
        loaded: true,
        loading: false,
        datas: page
      });
    }

    case datas.SAVE_FEATURES_FAILURE: {
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
export const getFeatures = (state: FeatureState) => state.datas;
export const getLoadingState = (state: FeatureState) => state.loading;