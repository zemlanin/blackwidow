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

function connectAsPlayer(gameId, playerId) {
  _send('CONNECT_PLAYER', {
    playerId: playerId,
    gameId: gameId,
  });

  return ws.incomingStream
    .filter(_typeEq('PLAYER'))
    .map('.payload')
    .take(1);
}

function getGamePlayers(gameId) {
  _send('GET_PLAYERS', {
    gameId: gameId,
  });

  return ws.incomingStream
    .filter(_typeEq('PLAYERS'))
    .map('.payload')
    .take(1);
}

function getGameState(gameId) {
  _send('GET_GAME_STATE', {
    gameId: gameId,
  });

  return ws.incomingStream
    .filter(_typeEq('GAME_STATE'))
    .map('.payload');
}

function pushNewPlayersInput(value) {
  _send('NEW_PLAYERS_INPUT', value);
}

module.exports = {
  connectedProperty: ws.connectedProperty,

  connectAsPlayer: connectAsPlayer,
  getGamePlayers: getGamePlayers,
  getGameState: getGameState,

  pushNewPlayersInput: pushNewPlayersInput,
};
