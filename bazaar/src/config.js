const firebase = require('firebase');

require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];


// SELF_INSTALL_UPDATE : Put firebase config here

 const config = {
  apiKey: 'XXXXXXXXXX',
  authDomain: 'XXXXXXXX',
  databaseURL: 'XXXXX',
 };


firebase.initializeApp(config);

const scriptInnerHTML = `
                  {
                    "@context": "http://schema.org",
                    "@type": "WebPage",
                    "name" : "DataTurks",
                    "url": "http://localhost:3000/projects"
                  }
                `;
const schema = {
  type: 'application/ld+json',
  innerHTML: scriptInnerHTML};
// export const googleProvider = new firebase.auth.GoogleAuthProvider();
// // export const ref = firebase.database().ref();
// export const firebaseAuth = firebase.auth;

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  apiURL: process.env.BASE_URL || 'https://dataturks.com/dataturks/',
  servingEnv: process.env.NODE_DEST || 'online',
  app: {
    title: 'Dataturks',
    description: 'Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.',
    head: {
      titleTemplate: 'Dataturks: %s',
      meta: [
        {name: 'description',
        content: 'Image Bounding Box, Image Classification, Text Classification, NER, NLP and other Machine Learning datasets'},
        {script: [schema]},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'DataTurks'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Best online platform for your ML data annotation needs'},
        {property: 'og:description', content: 'Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@dataturks'},
        {property: 'og:creator', content: '@dataturks'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  },

}, environment);
