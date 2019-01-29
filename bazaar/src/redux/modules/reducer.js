import { combineReducers } from 'redux';
// import multireducer from 'multireducer';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';
// import { pagination } from 'violet-paginator';

import auth from './auth';
// import {reducer as form} from 'redux-form';
import { loadingBarReducer } from 'react-redux-loading-bar';

import dataturksReducer from './dataturks';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  auth,

  // dataturks reducers
  dataturksReducer,
  loadingBar: loadingBarReducer
});
