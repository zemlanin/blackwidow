"use strict";

var R = require('ramda');

var sa = require('./storage_adapters/jo');

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);

  return sa.connectAsPlayer(gameId, localPlayerId)
    .doAction(R.pipe(
      R.prop('id'),
      localStorage.setItem.bind(localStorage, gameId)
    ));
}

function pushNewPlayersInput(value) {
  return sa.pushNewPlayersInput(value);
}

function gameStateStream(gameId) {
  return sa.getGameState(gameId);
}

function gamePlayersStream(gameId) {
  return sa.getGamePlayers(gameId);
}

module.exports = {
  connectAsPlayer: connectAsPlayer,
  pushNewPlayersInput: pushNewPlayersInput,
  gameStateStream: gameStateStream,
  gamePlayersStream: gamePlayersStream,
  connectedProperty: sa.connectedProperty,
};
