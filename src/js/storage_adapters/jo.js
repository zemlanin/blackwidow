// https://github.com/zemlanin/jo
"use strict";

var Bacon = require('baconjs');
var ws = require('./ws');

var _send = ws.outgoingStream.push.bind(ws.outgoingStream);

function connectAsPlayer(playerId) {
  _send({
    playerId: playerId,
    type: 'CONNECT_PLAYER',
  });

  return ws.incomingStream
    .filter(function (data) { return data.type === 'PLAYER'; })
    .take(1);
}

function getGamePlayers(gameId) {
  _send({
    gameId: gameId,
    type: 'GET_PLAYERS',
  });

  return ws.incomingStream
    .filter(function (data) { return data.type === 'PLAYERS'; })
    .take(1);
}

function getGameState(gameId) {
  _send({
    gameId: gameId,
    type: 'GET_GAME_STATE',
  });

  return ws.incomingStream
    .filter(function (data) { return data.type === 'GAME_STATE'; });
}

module.exports = {
  connectedProperty: ws.connectedProperty,

  connectAsPlayer: connectAsPlayer,
  getGamePlayers: getGamePlayers,
  getGameState: getGameState,

  pushNewGameState: Bacon.never,
  sendGameState: Bacon.never,

  waitNewGameInputs: Bacon.never,
  sendGameInput: Bacon.never,
  pushNewGameInput: Bacon.never,
};
