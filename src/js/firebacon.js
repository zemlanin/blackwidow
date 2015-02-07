"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var sa = require('./storage_adapters/firebase');

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
    .doAction(sa.setPlayerStatusToOnline);
}

function pushNewGameInput(gameId, value) {
  return sa.pushNewGameInput(gameId, value);
}

function removePlayerInput(gameId, inputIdOrObj) {
  var inputId = _.head(_.keys(inputIdOrObj)) || inputIdOrObj;

  if (inputId) {
    sa.sendGameInput(gameId, inputId, null).onValue();
  }
}

function gameInputStream(gameId) {
  return sa.waitNewGameInputs(gameId);
}

function setGameState(gameId, value) {
  sa.sendGameState(gameId, value).onValue();
}

function gameStateStream(gameId) {
  return sa.getGameState(gameId).map('.gameState');
}

function gamePlayersStream(gameId) {
  return sa.getGamePlayers(gameId).map('.players');
}

var clientStateBus = new Bacon.Bus();

function getClientStateBus() {
  return clientStateBus;
}

module.exports = {
  connectAsPlayer: connectAsPlayer,
  pushNewGameInput: pushNewGameInput,
  removePlayerInput: removePlayerInput,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  setGameState: setGameState,
  gamePlayersStream: gamePlayersStream,
  getClientStateBus: getClientStateBus,
};
