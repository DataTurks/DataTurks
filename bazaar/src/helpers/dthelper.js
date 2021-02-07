import firebase from "firebase";
import ReactGA from "react-ga";
import mixpanel from "mixpanel-browser";

import { DUMMY_UID, DUMMY_TOKEN } from "./Utils";
import config from '../config'

const superagent = require("superagent");

export const BASE_URL = (config.servingEnv === 'online' ? config.apiURL : window.location.protocol + "//" + window.location.hostname + '/dataturks/');

// export const BASE_URL = 'http://localhost:8080/dataturks/';

// const uid = '2c9fafb06185d9b3016185dbb66a0000';
// const token = '1234';
// const pid = '4028808361a21a9e0161a3b0c881000c';

export const logEvent = (category, action, label) => {
  try {
    if (label) {
      ReactGA.event({
        category,
        action,
        label
      });
      mixpanel.track(action);
    } else {
      ReactGA.event({
        category,
        action
      });
      mixpanel.track(action);
    }
  } catch (exception) {
    // statements
    console.log(exception);
  }
};

export const clearSessionStorage = () => {
  window.sessionStorage.removeItem("uid");
  window.sessionStorage.removeItem("token");
};

export const refreshToken = user => {
  if (user) {
    user
      .getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        console.log("refresh token", idToken);
        window.sessionStorage.setItem("token", idToken);
        setTimeout(function() {
          refreshToken();
        }, 60000 * 15);
      })
      .catch(function(error) {
        console.log("error generating token ", error);
      });
  } else {
    const cu = firebase.auth().currentUser;
    if (cu) {
      cu.getIdToken(/* forceRefresh */ true)
        .then(function(idToken) {
          console.log("refresh token", idToken);
          window.sessionStorage.setItem("token", idToken);
          setTimeout(function() {
            refreshToken();
          }, 60000 * 15);
        })
        .catch(function(error) {
          console.log("error generating token ", error);
        });
    }
  }
};

export const refreshUidToken = callbackFn => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("refreshuid user is", user);
      window.sessionStorage.setItem("uid", user.uid);
      firebase
        .auth()
        .currentUser.getIdToken(/* forceRefresh */ true)
        .then(function(idToken) {
          console.log("refresh token", idToken);
          window.sessionStorage.setItem("token", idToken);
          if (callbackFn) {
            callbackFn();
          }
          setTimeout(function() {
            refreshToken();
          }, 60000 * 5);
        })
        .catch(function(error) {
          console.log("error generating token ", error);
        }); // User is signed in.
    } else {
      return -1;
    }
  });
};

export const getUidToken = () => {
  let token = window.sessionStorage.getItem("token");
  let uid = window.sessionStorage.getItem("uid");
  if (!uid || !token || uid === null || token === null) {
    uid = DUMMY_UID;
    token = DUMMY_TOKEN;
  }
  return { uid, token };
};

export const fetchHits = (
  pid,
  start,
  count,
  callbackfn,
  type,
  label,
  userId,
  evaluationType
) => {
  console.log(
    "fetching project details ",
    pid,
    start,
    count,
    type,
    label,
    userId
  );
  const { uid, token } = getUidToken();
  let status = "notDone";
  if (type) {
    status = type;
  }
  let url =
    BASE_URL +
    pid +
    "/getHits?start=" +
    start +
    "&count=" +
    count +
    "&status=" +
    status;
  if (label) {
    url = url + "&label=" + label.replace(" ", "+");
  }
  if (userId) {
    url = url + "&userId=" + userId;
  }
  if (evaluationType) {
    url = url + "&evaluation=" + evaluationType;
  }
  superagent
    .post(url)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callbackfn(err, res);
    });
};

export const fetchStats = (pid, callback, cache) => {
  console.log("fetching project stats ", pid);
  const { uid, token } = getUidToken();
  let url = BASE_URL + pid + "/getProjectStats";
  if (cache !== undefined) {
    url = url + '?cache=' + cache;
  }
  superagent
    .post(url)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const getAPIKey = (callback) => {
  console.log("Get APIkey");
  const { uid, token } = getUidToken();
  let url = BASE_URL + "getAPIKey";
  superagent
    .post(url)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const editProject = (pid, data, callback) => {
  console.log("update proejct ", pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/updateProject")
    .send(data)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const deleteProjectDt = (pid, callback) => {
  console.log("delete proejct ", pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/deleteProject")
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const uploadFileDT = (file, pid, callbackfn, progressCallback, type) => {
  // console.log('uploading file ', file, uid, pida, token);
  const { uid, token } = getUidToken();
  const data = new FormData();
  data.append("file", file);
  data.append("filename", file.name);
  console.log("loadFile input is", data);
  if (type) {
    superagent
      .post(BASE_URL + pid + "/upload")
      .set("itemStatus", "preTagged")
      .set("format", type)
      .set("uid", uid)
      .set("token", token)
      .set("uploadFormat", type)
      .attach("file", file)
      .on("progress", function(event) {
        console.log("Percentage done: ", event.percent);
        progressCallback(event);
      })
      .end((err, res) => {
        callbackfn(err, res);
      });
  } else {
    superagent
      .post(BASE_URL + pid + "/upload")
      .set("uid", uid)
      .set("token", token)
      .attach("file", file)
      .on("progress", function(event) {
        console.log("Percentage done: ", event.percent);
        progressCallback(event);
      })
      .end((err, res) => {
        callbackfn(err, res);
      });
  }
};

export const getHomeData = (callback, cache) => {
  let url = "getUserHome";
  if (cache) {
    url = "getUserHome?cache=false";
  }
  const { uid, token } = getUidToken();
  console.log("getting home data from dthelper");
  superagent
    .post(BASE_URL + url)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const downloadfile = (pid, option, callback, format) => {
  const { uid, token } = getUidToken();
  let url = BASE_URL + pid + "/download?";
  if (option.toUpperCase() === "ALL") {
    url = url + "&items=ALL";
  }
  if (format && format.toUpperCase() === "STANFORD") {
    url = url + "&format=STANFORD_NER";
    superagent
      .post(url)
      .set("uid", uid)
      .set("token", token)
      .end((err, res) => {
        callback(err, res);
      });
  } else {
    superagent
      .post(url)
      .set("uid", uid)
      .set("token", token)
      .end((err, res) => {
        callback(err, res);
      });
  }
};

export const removeContributor = (pid, email, callback) => {
  console.log("sending invite ", pid);
  const { uid, token } = getUidToken();
  superagent
    .post(BASE_URL + pid + "/removeContributor?userEmail=" + email)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const sendInvite = (pid, email, isOwner, callback) => {
  console.log("sending invite ", pid, encodeURIComponent(email));
  const { uid, token } = getUidToken();
  let role = "CONTRIBUTOR";
  if (isOwner) {
    role = "OWNER";
  }
  superagent
    .post(
      BASE_URL +
        pid +
        "/addContributor?userEmail=" +
        encodeURIComponent(email) +
        "&role=" +
        role
    )
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const fetchProjectStats = (pid, callback) => {
  console.log("fetching project stats ", pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/getProjectDetails")
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const fetchHitsDetails = (
  pid,
  start,
  count,
  callback,
  type,
  label,
  userId
) => {
  console.log("fetching project stats ", pid, type, label, userId);
  const { uid, token } = getUidToken();
  let status = "done";
  if (type && type === "skipped") {
    status = "skipped";
  }
  let url =
    BASE_URL +
    pid +
    "/getHits?start=" +
    start +
    "&count=" +
    count +
    "&status=" +
    status;
  if (label) {
    url = url + "&label=" + label.replace(" ", "+");
  }
  if (userId) {
    url = url + "&userId=" + userId;
  }
  superagent
    .post(url)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const addKeyValues = (key, value, type, extra, callback) => {
  // console.log('adding hit ', hitId, pid);
  // const { uid, token } = getUidToken();
  // const data = { key, value, type, extra};
  superagent
    .get(
      "https://dataturks.com:8443/add/keyValue?key=" +
        key +
        "&value=" +
        value +
        "&type=" +
        type +
        "&extra=" +
        extra
    )
    .end((err, res) => {
      callback(err, res);
    });
};

export const skipHits = (hitId, pid, callback) => {
  console.log("adding hit ", hitId, pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/addHitResult?hitId=" + hitId)
    .send({ skipped: true })
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const createUserWithPassword = (fname, lname, email, password, callback) => {
  console.log("createUserWithPassword ", BASE_URL, window.location);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + "createUserWithPassword")
    .send({ firstName: fname, secondName: lname, email, authType: 'emailSignUp' })
    .set("uid", uid)
    .set("token", token)
    .set("password", password)
    .end((err, res) => {
      callback(err, res);
    });
};

export const dtLogin = (email, password, callback) => {
  // console.log("adding hit ", hitId, pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + "login")
    .set("uid", uid)
    .set("token", token)
    .set('email', email)
    .set("password", password)
    .end((err, res) => {
      callback(err, res);
    });
};

export const updateHitStatus = (hitId, pid, status, result, callback) => {
  console.log("update hit status", hitId, pid, status, result);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/addHitResult?hitId=" + hitId)
    .send({ status, result })
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const addHitEvaluation = (hitId, pid, evaluation, callback) => {
  console.log("update hit status", hitId, pid, evaluation);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/evaluationResult?hitId=" + hitId)
    .send({ evaluation })
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};

export const addHits = (hitId, result, pid, callback) => {
  console.log("adding hit ", hitId, pid);
  const { uid, token } = getUidToken();

  superagent
    .post(BASE_URL + pid + "/addHitResult?hitId=" + hitId)
    .send(result)
    .set("uid", uid)
    .set("token", token)
    .end((err, res) => {
      callback(err, res);
    });
};
