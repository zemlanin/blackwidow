'use strict';

var Bacon = require('baconjs');
var R = require('ramda');

function StoreStream(name) {
  var pushStream = new Bacon.Bus();

  var store = pushStream.scan({}, R.merge);

  this.name = name;
  this.pull = store.onValue.bind(store);
  this.push = pushStream.push.bind(pushStream);
}

var streamsMap = {};

function getStream(name) {
  streamsMap[name] = streamsMap[name] || new StoreStream(name);

  return streamsMap[name];
}

module.exports = {
  getStream: getStream,
};
