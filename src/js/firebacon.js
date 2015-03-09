"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var sa = require('./storage_adapters/jo');

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);
  var playerIdStream;

  if (_.isNull(localPlayerId)) {
    playerIdStream = sa.pushNewPlayer({
      name: Math.random().toString(16).substring(2),
      online: true,
      gameId: gameId
    }).doAction(localStorage.setItem.bind(localStorage, gameId));
  } else {
    playerIdStream = Bacon.once(localPlayerId);
  }

  return playerIdStream
    .flatMap(sa.getPlayer)
    .take(1)
    .filter(_.flow(_.values, _.any))
    .doAction(sa.signConnection);
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
