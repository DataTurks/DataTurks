import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import createMiddleware from './middleware/clientMiddleware';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import Immutable from 'immutable';
import {autoRehydrate} from 'redux-persist';

const { persistState } = require('redux-devtools');
import { loadingBarMiddleware } from 'react-redux-loading-bar';

export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  // const middleware = [createMiddleware(client), reduxRouterMiddleware, loadingBarMiddleware, thunk];
  // const middleware = [createMiddleware(client), reduxRouterMiddleware, thunk];
  const middleware = [
    createMiddleware(client),
    reduxRouterMiddleware,
    loadingBarMiddleware({
      promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAIL'],
    }),
    loadingBarMiddleware({
      promiseTypeSuffixes: ['BEGIN_GLOBAL_LOAD', 'END_GLOBAL_LOAD', 'END_GLOBAL_LOAD'],
    }),
    thunk,
  ];
  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const DevTools = require('../containers/DevTools/DevTools');
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = compose(applyMiddleware(...middleware), autoRehydrate()
                                    )(_createStore);
  }

  const reducer = require('./modules/reducer');
  if (data) {
    data.pagination = Immutable.fromJS(data.pagination);
  }
  const store = finalCreateStore(reducer, {});

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return store;
}
