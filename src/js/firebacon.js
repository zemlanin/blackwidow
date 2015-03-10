"use strict";

var _ = require('lodash');

var sa = require('./storage_adapters/jo');

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);

  return sa.connectAsPlayer(localPlayerId);
}

function pushNewGameInput(value) {
  return sa.pushNewGameInput(value);
}

function removePlayerInput(inputId) {
  sa.sendGameInput(inputId, null).onValue();
}

function gameInputStream(gameId) {
  return sa.waitNewGameInputs(gameId);
}

function setGameState(value) {
  var stateId = _.head(_.keys(value));
  var stateObj = _.head(_.values(value));
  sa.sendGameState(stateId, stateObj).onValue();
}

function gameStateStream(gameId) {
  return sa.getGameState(gameId)
    .map('.gameState');
}

function gamePlayersStream(gameId) {
  return sa.getGamePlayers(gameId).map('.players');
}

module.exports = {
  connectAsPlayer: connectAsPlayer,
  pushNewGameInput: pushNewGameInput,
  removePlayerInput: removePlayerInput,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  setGameState: setGameState,
  gamePlayersStream: gamePlayersStream,
  connectedProperty: sa.connectedProperty,
};
