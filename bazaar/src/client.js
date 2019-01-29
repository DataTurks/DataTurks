/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
// import io from 'socket.io-client';
import {Provider} from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import {persistStore} from 'redux-persist';
import getRoutes from './routes';
import { Segment } from 'semantic-ui-react';

const client = new ApiClient();
const _browserHistory = useScroll(() => browserHistory)();
// const dest = document.getElementById('content');
console.log('window data is', window._data);
const store = createStore(_browserHistory, client, window.__data);
const history = syncHistoryWithStore(_browserHistory, store);

// function initSocket() {
//   const socket = io('', {path: '/ws'});
//   socket.on('news', (data) => {
//     console.log(data);
//     socket.emit('my other event', { my: 'data from client' });
//   });
//   socket.on('msg', (data) => {
//     console.log(data);
//   });

//   return socket;
// }

// global.socket = initSocket();

class AppProvider extends React.Component {

  constructor() {
    super();
    this.state = { rehydrated: false };
  }

  componentWillMount() {
    persistStore(store, { blacklist: ['routing', 'dataturksReducer'] }, () => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    const component = (
              <Router render={(props) =>
                    <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
                  } history={history}>
                {getRoutes(store)}
              </Router>
            );

    if (!this.state.rehydrated) {
      return (<div><Segment basic loading/></div>);
    } else if (this.state.rehydrated) {
      console.log('rehydrating ', component);
      return (
            <Provider store={store} key="provider">
              {component}
            </Provider>);
    }
  }
}

const dest = document.getElementById('content');

ReactDOM.render(
  <AppProvider />,
  dest
);
// const persistor = persistStore(store, {}, () => { this.rehydrated = true; });


