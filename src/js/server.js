"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');
var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');
var ƒ = require('./funcy');
var interpreter = require('./interpreter');

var FullServerPage = React.createFactory(components.FullServerPage);

var gameId = routing.getGameId();
if (gameId === null) {
  gameId = routing.generateGameId();
  routing.setGameId(gameId);
}

var serverPage = React.render(
  FullServerPage({
    gameId: gameId,
    title: '…',
    players: [],
  }),
  document.body
);

var gameState = firebacon.gameStateStream(gameId).toProperty();
var playersStream = firebacon.gamePlayersStream(gameId).toProperty();

gameState
  .map(function (state) {
    var stateObj = _.head(_.values(state));
    return {
      title: stateObj.lastInput ? stateObj.lastInput.input.toString() : '?',
      gameField: stateObj.gameField,
    };
  })
  .onValue(serverPage.setProps.bind(serverPage));

Bacon.zipAsArray(
  Bacon.constant(gameId),
  gameState,
  playersStream
)
  .sampledBy(
    firebacon.gameInputStream(gameId),
    '.concat'
  )
  .flatMap(ƒ.ply(interpreter.inputsMachine))
  .doAction(_.flow(
    _.bind(_.at, null, _, 1),
    _.head,
    firebacon.setGameState
  ))
  .doAction(_.flow(
    _.bind(_.at, null, _, 3),
    _.head,
    _.keys,
    _.head,
    firebacon.removePlayerInput
  ))
  .onValue();

playersStream
  .take(1)
  .filter(_.isNull)
  .map({title: 'waiting players'})
  .onValue(serverPage.setProps.bind(serverPage));

playersStream
  .filter(_.size)
  .map(ƒ.fromKey('players'))
  .onValue(serverPage.setProps.bind(serverPage));
