"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var sa = require('./storage_adapters/firebase');

function pushNewPlayer(gameId, value) {
  return sa.pushChildValue(sa.getChildPath(gameId).child('players'), value);
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
    .map(sa.getChildPath.bind(null, gameId))
    .flatMap(sa.childOnValue)
    .take(1)
    .filter(_.flow(_.values, _.any))
    .doAction(sa.setPlayerStatusToOnline.bind(null, gameId));
}

function pushNewPlayerInput(gameId, value) {
  return sa.pushChildValue(sa.getChildPath(gameId).child('gameInput'), value);
}

function removePlayerInput(gameId, inputIdOrObj) {
  var inputId = _.head(_.keys(inputIdOrObj));

  if (inputId) {
    sa.setChildValue(
      sa.getChildPath(gameId).child('gameInput').child(inputId),
      null
    ).onValue();
  }
}

function gameInputStream(gameId) {
  return sa.childOnChildAdded(sa.getChildPath(gameId).child('gameInput'));
}

function getGameStatePath(gameId) {
  return sa.getChildPath(gameId).child('gameState');
}

function setGameState(gameId, value) {
  sa.setChildValue(getGameStatePath(gameId), value).onValue();
}

function gameStateStream(gameId) {
  return (
    sa.childOnValue(getGameStatePath(gameId))
      .map('.gameState')
  );
}

function gamePlayersStream(gameId) {
  return (
    sa.childOnValue(sa.getChildPath(gameId).child('players'))
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
