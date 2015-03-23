// https://github.com/zemlanin/jo
"use strict";

var R = require('ramda');
var ws = require('./ws');

function _send(type, payload) {
  ws.outgoingStream.push({
    type: type,
    payload: payload,
  });
}

var _typeEq = R.propEq('type');
var _gameIdEq = R.propEq('gameId');

function sendCredentials(gameId, playerId) {
  _send('CONNECT_PLAYER', {
    playerId: playerId,
    gameId: gameId,
  });
}

function connectAsPlayer(gameId, playerId) {
  sendCredentials(gameId, playerId);

  return ws.incomingStream
    .filter(_typeEq('PLAYER'))
    .map('.payload')
    .filter(_gameIdEq(gameId));
}

function getGamePlayers(gameId) {
  _send('GET_PLAYERS', {
    gameId: gameId,
  });

  return ws.incomingStream
    .filter(_typeEq('PLAYERS'))
    .map('.payload')
    .filter(_gameIdEq(gameId));
}

function getGameState(gameId) {
  _send('GET_GAME_STATE', {
    gameId: gameId,
  });

  return ws.incomingStream
    .filter(_typeEq('GAME_STATE'))
    .map('.payload')
    .filter(_gameIdEq(gameId));
}

function pushNewPlayersInput(value) {
  _send('NEW_PLAYERS_INPUT', value);
}

function switchController(value) {
  _send('CHANGE_PLAYER_CONTROLLERS', value);
}

module.exports = {
  connectedProperty: ws.connectedProperty,

  sendCredentials: sendCredentials,
  connectAsPlayer: connectAsPlayer,
  getGamePlayers: getGamePlayers,
  getGameState: getGameState,

  pushNewPlayersInput: pushNewPlayersInput,
  switchController: switchController,
};
