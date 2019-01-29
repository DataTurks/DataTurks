#!/usr/bin/env node
require('../server.babel'); // babel registration (runtime transpilation for node)
var path = require('path');
var rootDir = path.resolve(__dirname, '..');
/**
 * Define isomorphic constants.
 */

console.log('servver bin ', process.env.NODE_DEST);
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = process.env.NODE_DEST === 'onpremise' ? true :  false;  // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

if (__DEVELOPMENT__) {
  if (!require('piping')({
      hook: true,
      ignore: /(\/\.|~$|\.json|\.scss$)/i
    })) {
    return;
  }
}

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
if (process.env.NODE_DEST === 'onpremise') {
	global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
	  .server(rootDir, function() {
	    require('../src/server-onprem');
	  });
} else {
	global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
	  .server(rootDir, function() {
	    require('../src/server');
	  });
}
