// https://github.com/zemlanin/jo
"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');
var ws = require('./ws');

var _send = ws.outgoingStream.push.bind(ws.outgoingStream);

function pushNewPlayer(player) {
  var gameId = player.gameId;

  if (!gameId) {
    return Bacon.never();
  }

  _send({
    player: player,
    type: 'NEW_PLAYER',
  });

  return ws.incomingStream
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

  return ws.incomingStream
    .filter(function (data) { return data.type === 'SIGN_CONNECTION'; })
    .take(1);
}

function getPlayer(playerId) {
  _send({
    playerId: playerId,
    type: 'GET_PLAYER',
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
