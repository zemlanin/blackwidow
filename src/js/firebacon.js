"use strict";

var R = require('ramda');

var jo = require('./storage_adapters/jo');

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);

  return jo.connectAsPlayer(gameId, localPlayerId)
    .combine(
      jo.connectedProperty,
      function (player, connected) {
        return R.merge(player, {online: connected});
      }
    )
    .doAction(R.pipe(
      R.prop('id'),
      localStorage.setItem.bind(localStorage, gameId)
    ));
}

function pushNewPlayersInput(value) {
  return jo.pushNewPlayersInput(value);
}

function gameStateStream(gameId) {
  return jo.getGameState(gameId);
}

function gamePlayersStream(gameId) {
  return jo.getGamePlayers(gameId);
}

module.exports = {
  sendCredentials: jo.sendCredentials,
  connectAsPlayer: connectAsPlayer,
  pushNewPlayersInput: pushNewPlayersInput,
  gameStateStream: gameStateStream,
  gamePlayersStream: gamePlayersStream,
  connectedProperty: jo.connectedProperty,
};
