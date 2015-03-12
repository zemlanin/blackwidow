"use strict";

var _ = require('lodash');
var R = require('ramda');
var Bacon = require('baconjs');

// TODO: move url in config file
var wsUrl = "ws://localhost:8080/";

function _deepFreeze(o) {
  var prop, propKey;
  Object.freeze(o);
  for (propKey in o) {
    prop = o[propKey];
    if (!o.hasOwnProperty(propKey) || !_.isObject(prop) || Object.isFrozen(prop)) {
      continue;
    }

    _deepFreeze(prop);
  }
}

function _valuesMapper(event) {
  var data = JSON.parse(event.data.replace(/}.*$/, '}'));
  _deepFreeze(data);
  return data;
}

var wsOpen = new Bacon.Bus();
var wsClose = new Bacon.Bus();

function _reconnect(retry) {
  setTimeout(
    wsClose.push.bind(wsClose, retry),
    1000 * Math.exp(retry)
  );
}

function _wsOpenHandler(prev, ws) {
  ws.onclose = wsClose.push.bind(wsClose, null);
  return ws;
}

function _wsCloseHandler(prev, retry) {
  if (prev) {
    prev.removeEventListener('message', _valuesMapper);
  }

  if (retry === 0) {
    retry = 1;
  } else if (retry > 5) {
    return null;
  }

  var ws = new WebSocket(wsUrl);
  ws.onopen = wsOpen.push.bind(wsOpen, ws);
  ws.onclose = _reconnect.bind(ws, (retry ? retry + 1 : 1));
  return ws;
}

var wsProperty = Bacon.update(
  null,
  [wsOpen], _wsOpenHandler,
  [wsClose], _wsCloseHandler
);

(function _initWsStream() {
  wsProperty.onValue(_.noop);
  wsClose.push(null);
}());

var connectedProperty = wsProperty
  .map('.readyState')
  .map(R.eq(1));

var outgoingStream = new Bacon.Bus();
wsProperty
  .sampledBy(
    outgoingStream.holdWhen(connectedProperty.not()).flatMap(JSON.stringify),
    R.func('send')
  ).onValue(_.noop);

var incomingStream = wsProperty
  .filter(_.isObject)
  .flatMap(function (ws) {
    return Bacon.fromEventTarget(ws, 'message', _valuesMapper);
  });

module.exports = {
  incomingStream: incomingStream,
  outgoingStream: outgoingStream,
  connectedProperty: connectedProperty,
};
