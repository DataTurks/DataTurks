import superagent from 'superagent';
import config from '../config';

const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  console.log(' path is ', path);
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    console.log(' formate url1', config.apiHost, config.apiPort);
    return 'https://bonsaiapp.in:8443/dataturks/' + adjustedPath;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  console.log(' formate url2', config.apiHost, config.apiPort);
  return '/api' + adjustedPath;
}

export function jsonEscape(str) {
  return str.replace(/\n/g, ' \\n ').replace(/\r/g, ' \\r ').replace(/\t/g, ' \\t ');
}


export default class ApiClient {
  constructor(req) {
    methods.forEach((method) =>
      this[method] = (path, { params, data, headers } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));

        if (params) {
          request.query(params);
        }

        console.log('headers are', headers);

        if (headers) {
          request.set(headers);
        }

        if (__SERVER__ && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));
        }

        if (data) {
          console.log('req data is', data);
          request.send(data);
        }

        request.end((err, { body } = {}) => {
          if (err) {
            console.log('apiclient error is', err);
            reject(body || err);
          } else {
            resolve(body);
          } });
      }));
  }
  /*
   * There's a V8 bug where, when using Babel, exporting classes with only
   * constructors sometimes fails. Until it's patched, this is a solution to
   * "ApiClient is not defined" from issue #14.
   * https://github.com/erikras/react-redux-universal-hot-example/issues/14
   *
   * Relevant Babel bug (but they claim it's V8): https://phabricator.babeljs.io/T2455
   *
   * Remove it at your own risk.
   */
  empty() {}
}
