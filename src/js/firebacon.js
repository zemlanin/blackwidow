"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var sa = require('./storage_adapters/firebase');

function pushNewPlayer(gameId, value) {
  return sa.pushChildValue(sa.getPlayerPath(gameId), value);
}

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);
  var playerIdStream;

  if (_.isNull(localPlayerId)) {
    playerIdStream = pushNewPlayer(
      gameId,
      {
        name: Math.random().toString(16).substring(2),
        online: true,
      }
    ).doAction(localStorage.setItem.bind(localStorage, gameId));
  } else {
    playerIdStream = Bacon.once(localPlayerId);
  }

  return playerIdStream
    .map(sa.getPlayerPath.bind(null, gameId))
    .flatMap(sa.childOnValue)
    .take(1)
    .filter(_.flow(_.values, _.any))
    .doAction(sa.setPlayerStatusToOnline.bind(null, gameId));
}

function pushNewPlayerInput(gameId, value) {
  return sa.pushChildValue(sa.getInputsPath(gameId), value);
}

function removePlayerInput(gameId, inputIdOrObj) {
  var inputId = _.head(_.keys(inputIdOrObj));

  if (inputId) {
    sa.setChildValue(
      sa.getInputsPath(gameId, inputId),
      null
    ).onValue();
  }
}

function gameInputStream(gameId) {
  return sa.childOnChildAdded(sa.getInputsPath(gameId));
}

function setGameState(gameId, value) {
  sa.setChildValue(sa.getGameStatePath(gameId), value).onValue();
}

function gameStateStream(gameId) {
  return (
    sa.childOnValue(sa.getGameStatePath(gameId))
      .map('.gameState')
  );
}

function gamePlayersStream(gameId) {
  return (
    sa.childOnValue(sa.getPlayerPath(gameId))
      .map('.players')
  );
}

var clientStateBus = new Bacon.Bus();

function getClientStateBus() {
  return clientStateBus;
}

module.exports = {
  connectAsPlayer: connectAsPlayer,
  pushNewPlayerInput: pushNewPlayerInput,
  removePlayerInput: removePlayerInput,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  setGameState: setGameState,
  gamePlayersStream: gamePlayersStream,
  getClientStateBus: getClientStateBus,
};
