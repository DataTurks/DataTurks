import firebase from 'firebase';
import { BASE_URL, clearSessionStorage } from '../../helpers/dthelper';
const superagent = require('superagent');

const LOAD = 'redux-example/auth/LOAD';
const LOAD_SUCCESS = 'redux-example/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/auth/LOAD_FAIL';
export const LOGIN = 'redux-example/auth/LOGIN';
const LOGIN_SUCCESS = 'redux-example/auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'redux-example/auth/LOGIN_FAIL';
export const LOGOUT = 'redux-example/auth/LOGOUT';
const LOGOUT_SUCCESS = 'redux-example/auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'redux-example/auth/LOGOUT_FAIL';

export const SIGN_IN = 'redux-example/auth/SIGN_IN';

const USER_VERIFY = 'redux-example/auth/USER_VERIFY';
const USER_VERIFY_SUCCESS = 'redux-example/auth/USER_VERIFY_SUCCESS';
const USER_VERIFY_FAIL = 'redux-example/auth/USER_VERIFY_FAIL';
const RESET_FLAG = 'redux-example/auth/RESET_FLAG';

const initialState = {
  loaded: false,
  loggingIn: false,
  userCreated: false,
};

export default function reducer(state = initialState, action = {}) {
  console.log('auth reduce called ', state, action);
  switch (action.type) {
    case USER_VERIFY:
      return {
        ...state,
        loading: true,
        loggingIn: true
      };
    case RESET_FLAG:
      return {
        ...state,
        userCreated: false
      };
    case USER_VERIFY_SUCCESS:
      window.sessionStorage.setItem('uid', action.result.uid);
      window.sessionStorage.setItem('token', action.result.pa);
      return {
        ...state,
        loading: false,
        loggingIn: false
      };
    case USER_VERIFY_FAIL:
      return {
        ...state,
        user: undefined,
        loading: false,
        loggingIn: false
      };
    case SIGN_IN:
      return {
        ...state,
        loggingIn: false,
        user: action.data
      };
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        userCreated: true
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        loginError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      };
    default:
      return state;
  }
}


export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}


export function signIn(user) {
  return {
    type: SIGN_IN,
    data: user
  };
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadAuth')
  };
}

export function login(req, uid, accesstoken ) {
  console.log('login called', req, uid, accesstoken);
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + 'createUser').send(req).set('uid', uid).set('token', accesstoken)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}

export function resetFlags() {
  return {
    type: RESET_FLAG
  };
}

export function verifyUser() {
  console.log('verifying ');
  return {
    types: [USER_VERIFY, USER_VERIFY_SUCCESS, USER_VERIFY_FAIL],
    promise: () => new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          reject();
        }
      });
    })
  };
}

export function logout() {
  // firebase.auth().signOut().then(function() {
  //   return { type: LOGOUT_SUCCESS };
  // }).catch(function(error) {
  //   console.log('error in logout ', error);
  //   return { type: LOGOUT_FAIL };
  //   // An error happened.
  // });
  clearSessionStorage();
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: () => firebase.auth().signOut()
  };
}
