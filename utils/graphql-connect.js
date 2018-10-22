var apolloLink = require('apollo-link'),
    linkHttp = require('apollo-link-http'),
    fetch = require('node-fetch'),
    config = require('./config');

var HttpLink = linkHttp.HttpLink;

var link = new HttpLink({
  uri: config.MARVELAPP_GQL_URL,
  fetch: fetch,
  headers: {
    authorization: `Bearer ${process.env.MARVELAPP_TOKEN}`
  }
});

module.exports = {
  link: link,
  execute: apolloLink.execute,
  makePromise: apolloLink.makePromise
}
