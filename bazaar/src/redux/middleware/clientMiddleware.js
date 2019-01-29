import { logout } from '../modules/auth';
export default function clientMiddleware(client) {
  return ({dispatch, getState}) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
      if (!promise) {
        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({...rest, type: REQUEST});

      const actionPromise = promise(client);
      actionPromise.then(
        (result) => next({...rest, result, type: SUCCESS}),
        (error) => {
          console.log('1 middleware error ', error, error.code, error.message);
          if (error.message === 'Unauthorized') {
            dispatch(logout());
          } else {
            next({...rest, error, type: FAILURE});
          }
        }
      ).catch((error)=> {
        console.log('2 MIDDLEWARE ERROR:', error, error.message);
        next({...rest, error, type: FAILURE});
      });

      return actionPromise;
    };
  };
}
