const superagent = require('superagent');
import { BASE_URL } from '../../helpers/dthelper';
import { LOGIN, LOGOUT, SIGN_IN } from './auth';
const LOAD = 'redux-example/auth/LOAD';
const LOAD_SUCCESS = 'redux-example/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/auth/LOAD_FAIL';
const RESET = 'redux-example/store/RESET';

const UPLOAD_DATA_FORM = 'redux-example/dataturks/UPLOAD_DATA_FORM_REQUET';
const UPLOAD_DATA_FORM_SUCCESS = 'redux-example/dataturks/UPLOAD_DATA_FORM_SUCCESS';
const UPLOAD_DATA_FORM_FAILURE = 'redux-example/dataturks/UPLOAD_DATA_FORM_FAIL';

const UPLOAD_FILE_STATS = 'redux-example/dataturks/UPLOAD_FILE_STATS';
const TAG_DATA_ROW = 'redux-example/dataturks/TAG_DATA_ROW';
const SELECT_PROJECT = 'redux-example/dataturks/SELECT_PROJECT';
const UPDATE_CURRENT_PROJECT_DETAILS = 'redux-example/dataturks/UPDATE_CURRENT_PROJECT_DETAILS';
const UPDATE_HOME_DATA = 'redux-example/dataturks/UPDATE_HOME_DATA';
const UPDATE_CURRENT_HIT = 'redux-example/dataturks/UPDATE_CURRENT_HIT';

const GET_HOME_DATA = 'redux-example/dataturks/GET_HOME_DATA_REQUST';
const GET_HOME_DATA_SUCCESS = 'redux-example/dataturks/GET_HOME_DATA_SUCCESS';
const GET_HOME_DATA_FAILURE = 'redux-example/dataturks/GET_HOME_DATA_FAIL';

const GET_PROJECT_ID = 'redux-example/dataturks/GET_PROJECT_ID';
const GET_PROJECT_ID_SUCCESS = 'redux-example/dataturks/GET_PROJECT_ID_SUCCESS';
const GET_PROJECT_ID_FAILURE = 'redux-example/dataturks/GET_PROJECT_ID_FAILURE';

const GET_ORG_DETAILS = 'redux-example/dataturks/GET_ORG_DETAILS_REQUEST';
const GET_ORG_DETAILS_SUCCESS = 'redux-example/dataturks/GET_ORG_DETAILS_SUCCESS';
const GET_ORG_DETAILS_FAILURE = 'redux-example/dataturks/GET_ORG_DETAILS_FAIL';

const GET_PROJECT_DETAIL = 'redux-example/dataturks/GET_PROJECT_DETAIL_REQUEST';
const GET_PROJECT_DETAIL_SUCCESS = 'redux-example/dataturks/GET_PROJECT_DETAIL_SUCCESS';
const GET_PROJECT_DETAIL_FAILURE = 'redux-example/dataturks/GET_PROJECT_DETAIL_FAIL';

const SET_ERROR = 'redux-example/dataturks/SET_ERROR';

const TOGGLE_MENU = 'redux-example/dataturks/TOGGLE_MENU';

const initialState = {
  loaded: false,
  loggingIn: false,
  user: null,
  menuHidden: false,
  orgName: undefined,
  projectCreated: false,
  currentProject: undefined,
  projectCreateError: undefined,
  projectDetails: null,
  orgData: null,
  currentHit: null,
  plan: undefined,
  labelsDone: undefined,
  labelsAllowed: undefined,
  subscriptionExpiryTimestamp: undefined,
  hasSubscriptionExpired: false,
  projects: null,
  globalError: undefined,
  orgDataFailure: null,
  currentPathProject: undefined,
  currentPathOrg: undefined
};

export default function dataturksReducer(state = initialState, action = {}) {
  console.log('dt reduce called ', state, action);
  switch (action.type) {
    case TOGGLE_MENU:
      return {
        ...state,
        menuHidden: action.value
      };
    case SET_ERROR:
      return {
        ...state,
        globalError: action.value
      };
    case GET_PROJECT_DETAIL:
      return {
        ...state,
        loading: true
      };
    case GET_PROJECT_DETAIL_SUCCESS:
      return {
        ...state,
        projectDetails: action.result.body
      };
    case GET_PROJECT_DETAIL_FAILURE:
      return {
        ...state,
        projectDetails: undefined
      };
    case GET_ORG_DETAILS:
      return {
        ...state,
        loading: true
      };
    case GET_ORG_DETAILS_SUCCESS:
      return {
        ...state,
        orgData: action.result.body
      };
    case GET_ORG_DETAILS_FAILURE:
      let error = 'Internal Server Error';
      if (action.error.response && action.error.response.body && action.error.response.body.message) {
        error = action.error.response.body.message;
      }
      return {
        ...state,
        orgDataFailure: error
      };
    case GET_PROJECT_ID:
      return {
        ...state,
        loading: true,
        currentProject: undefined
      };
    case GET_PROJECT_ID_FAILURE:
      return {
        ...state,
        loading: false,
        currentProject: undefined
      };
    case GET_PROJECT_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        currentProject: action.result.body.response
      };
    case GET_HOME_DATA_SUCCESS:
      let orgName = undefined;
      if (action.result.body.projects && action.result.body.projects.length > 0) {
        for (let index = 0; index < action.result.body.projects.length; index ++) {
          console.log(' project is ', action.result.body.projects[index]);
          if (action.result.body.projects[index].role === 'OWNER') {
            orgName = action.result.body.projects[index].projectDetails.orgName;
          }
        }
      }
      console.log('orgName is ', orgName);
      return {
        ...state,
        user: action.result.body.userDetails,
        projects: action.result.body.projects,
        orgName
      };
    case LOGIN:
    case LOGOUT:
    case RESET:
    case SIGN_IN:
      console.log('resetting state');
      return initialState;
    case UPDATE_CURRENT_HIT:
      return {
        ...state,
        currentHit: action.data
      };
    case UPDATE_HOME_DATA:
      return {
        ...state,
        projects: action.projects,
        plan: action.plan,
        subscriptionExpiryTimestamp: action.subscriptionExpiryTimestamp,
        labelsAllowed: action.labelsAllowed,
        labelsDone: action.labelsDone,
        hasSubscriptionExpired: action.hasSubscriptionExpired
      };
    case UPDATE_CURRENT_PROJECT_DETAILS:
      return {
        ...state,
        projectDetails: action.data
      };

    case UPLOAD_FILE_STATS:
      return {
        ...state,
        uploadedFileStats: action.stats
      };
    case SELECT_PROJECT:
      return {
        ...state,
        projectCreated: false,
        currentProject: action.id
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
    case UPLOAD_DATA_FORM:
      return {
        ...state,
        loading: true,
        projectCreateError: undefined
      };
    case UPLOAD_DATA_FORM_SUCCESS:
      return {
        ...state,
        projectCreated: true,
        currentProject: action.result.body.response
      };
    case UPLOAD_DATA_FORM_FAILURE:
      error = 'Error in project creation';
      if (action.error.response && action.error.response.body && action.error.response.body.message) {
        error = action.error.response.body.message;
      }
      return {
        ...state,
        loading: false,
        loaded: false,
        projectCreateError: error
      };
    case TAG_DATA_ROW:
      return {
        ...state,
        loading: true
      };
    case 'persist/PERSIST':
      return {
        state
      };
    case '@@router/LOCATION_CHANGE':
      console.log('dataturks location is changing', action);
      const pathSplits = action.payload.pathname.split('/');
      let menuHidden = state.menuHidden;
      console.log('locationchange', pathSplits);
      if (pathSplits.length === 5 && pathSplits[4] === 'space') {
        menuHidden = true;
      }
      if (action.payload.pathname === '/projects/create') {
        return {...state, menuHidden, currentPathProject: pathSplits[3], currentPathOrg: pathSplits[2], locationPath: action.payload.pathname, currentProject: null, projectCreated: false, projectDetails: null };
      } else if (action.payload.pathname === '/projects/import') {
        return {...state, menuHidden, currentPathProject: pathSplits[3], currentPathOrg: pathSplits[2], locationPath: action.payload.pathname, currentProject: null, projectCreated: false };
      }

      return {...state, menuHidden, currentPathProject: pathSplits[3], currentPathOrg: pathSplits[2], locationPath: action.payload.pathname};
    default:
      return state;
  }
}

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'UID': '2c9fafb06185d9b3016185dbb66a0000',
  'TOKEN': '12345'
};

export function resetState() {
  return {
    type: RESET
  };
}

export function setError( value ) {
  return {
    type: SET_ERROR,
    value: value
  };
}

export function toggleMenu( value ) {
  return {
    type: TOGGLE_MENU,
    value: value
  };
}

export function uploadDataForm(input, uidToken) {
  console.log('upload form data ', input);
  const { uid, token } = uidToken;
  HEADERS.TOKEN = token;
  HEADERS.UID = uid;
  return {
    types: [ UPLOAD_DATA_FORM, UPLOAD_DATA_FORM_SUCCESS, UPLOAD_DATA_FORM_FAILURE ],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + 'createProject').send(input).set('uid', uid).set('token', token)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}

export function getUserHomeData(uidToken) {
  const { uid, token } = uidToken;
  console.log('get home data ', uid, token);
  HEADERS.TOKEN = token;
  HEADERS.UID = uid;
  return {
    types: [ GET_HOME_DATA, GET_HOME_DATA_SUCCESS, GET_HOME_DATA_FAILURE ],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + 'getUserHome').set('uid', uid).set('token', token)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}

export function getProjectDetails(pid, uidToken) {
  const { uid, token } = uidToken;
  console.log('get home data ', uid, token);
  HEADERS.TOKEN = token;
  HEADERS.UID = uid;
  return {
    types: [ GET_PROJECT_DETAIL, GET_PROJECT_DETAIL_SUCCESS, GET_PROJECT_DETAIL_FAILURE ],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + pid + '/getProjectDetails').set('uid', uid).set('token', token)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}


export function setCurrentProject(input, uidToken) {
  const { uid, token } = uidToken;
  HEADERS.TOKEN = token;
  HEADERS.UID = uid;
  return {
    types: [ GET_PROJECT_ID, GET_PROJECT_ID_SUCCESS, GET_PROJECT_ID_FAILURE ],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + 'getProjectId').send(input).set('uid', uid).set('token', token)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}

export function getOrgDetails(orgName, uidToken, cache) {
  const { uid, token } = uidToken;
  HEADERS.TOKEN = token;
  HEADERS.UID = uid;
  let url = 'getOrgProjects?orgName=';
  if (cache) {
    url = 'getOrgProjects?cache=false&orgName=';
  }
  return {
    types: [ GET_ORG_DETAILS, GET_ORG_DETAILS_SUCCESS, GET_ORG_DETAILS_FAILURE ],
    promise: () => new Promise((resolve, reject) => {
      superagent.post(BASE_URL + url + orgName).set('uid', uid).set('token', token)
      .end((error, res) => {
        if (error) reject(error); else resolve(res);
      });
    })
  };
}

export function updateFileUploadStats(input) {
  return {
    type: UPLOAD_FILE_STATS,
    stats: input
  };
}

export function updateHomeData(userData, projects, plan, labelsAllowed, labelsDone, subscriptionExpiryTimestamp, hasSubscriptionExpired) {
  return {
    type: UPDATE_HOME_DATA,
    user: userData,
    projects,
    plan,
    labelsDone,
    labelsAllowed,
    subscriptionExpiryTimestamp,
    hasSubscriptionExpired
  };
}

export function selectProject(input) {
  return {
    type: SELECT_PROJECT,
    id: input
  };
}

export function updateProjectDetails(input) {
  return {
    type: UPDATE_CURRENT_PROJECT_DETAILS,
    data: input
  };
}

export function setCurrentHit(input) {
  return {
    type: UPDATE_CURRENT_HIT,
    data: input
  };
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadAuth')
  };
}

