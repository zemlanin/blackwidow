"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var ƒ = require('./funcy');
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
    .map('.gameState')
    .flatMap(function (existing) {
      if (existing) {
        return existing;
      }

      var initState = {
        gameId: gameId,
        gameField: {x: 0, y: 0}
      };
      return sa.pushNewGameState(initState)
        .map(_.bind(ƒ.fromKey, null, _, initState));
    });
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
