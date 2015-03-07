// https://github.com/zemlanin/jo
"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

// TODO: move url in config file
var websocket = new WebSocket("ws://localhost:8080/");
var incomingStream;
var outgoingStream = new Bacon.Bus();

outgoingStream
  .holdWhen(
    Bacon.fromEventTarget(websocket, 'open', _.constant(false)).toProperty(true)
  )
  .map(JSON.stringify)
  .subscribe(websocket.send.bind(websocket));

var _send = outgoingStream.push.bind(outgoingStream);

function deepFreeze(o) {
  var prop, propKey;
  Object.freeze(o);
  for (propKey in o) {
    prop = o[propKey];
    if (!o.hasOwnProperty(propKey) || !(typeof prop === 'object') || Object.isFrozen(prop)) {
      continue;
    }

    deepFreeze(prop);
  }
}

function _valuesMapper(event) {
  var data = JSON.parse(event.data.replace(/}.*$/, '}'));
  deepFreeze(data);
  return data;
}

function _sinkNext(sink, value) {
  sink(new Bacon.Next(_valuesMapper(value)));
}

function _sinkError(sink, error) {
  sink(new Bacon.Error(error));
}

function _sinkEnd(sink) {
  sink(new Bacon.End());
}

incomingStream = Bacon.fromBinder(function (sink) {
  // websocket.onopen = _sinkNext.bind(null, sink);
  websocket.onmessage = _sinkNext.bind(null, sink);
  //websocket.onmessage = console.log.bind(console);
  websocket.onerror = _sinkError.bind(null, sink);
  websocket.onclose = _sinkEnd.bind(null, sink);

  return _.noop;
});

function pushNewPlayer(player) {
  var gameId = player.gameId;

  if (!gameId) {
    return Bacon.never();
  }

  _send({
    player: player,
    type: 'NEW_PLAYER',
  });

  return incomingStream
    .filter(function (data) { return data.type === 'NEW_PLAYER'; })
    .take(1)
    .map('.playerId');
}

function signConnection(player) {
  var playerId = _.head(_.keys(player));

  _send({
    playerId: playerId,
    type: 'SIGN_CONNECTION',
  });

  return incomingStream
    .filter(function (data) { return data.type === 'SIGN_CONNECTION'; })
    .take(1);
}

function getPlayer(playerId) {
  _send({
    playerId: playerId,
    type: 'GET_PLAYER',
  });

  return incomingStream
    .filter(function (data) { return data.type === 'GET_PLAYER'; })
    .take(1);
}

function getGamePlayers(gameId) {
  _send({
    gameId: gameId,
    type: 'GET_PLAYERS',
  });

  return incomingStream
    .filter(function (data) { return data.type === 'GET_PLAYERS'; })
    .take(1);
}

function getGameState(gameId) {
  _send({
    gameId: gameId,
    type: 'GET_GAME_STATE',
  });

  return incomingStream
    .filter(function (data) { return data.type === 'GET_GAME_STATE'; })
    .take(1);
}

module.exports = {
  getPlayer: getPlayer,
  pushNewPlayer: pushNewPlayer,
  signConnection: signConnection,

  getGamePlayers: getGamePlayers,

  getGameState: getGameState,
  pushNewGameState: Bacon.never,
  sendGameState: Bacon.never,

  waitNewGameInputs: Bacon.never,
  sendGameInput: Bacon.never,
  pushNewGameInput: Bacon.never,
};
