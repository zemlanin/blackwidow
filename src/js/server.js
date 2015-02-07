"use strict";

var _ = require('lodash');
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

gameState
  .filter(_.isObject)
  .map(function (state) {
    return {
      title: state.lastInput ? state.lastInput.input.toString() : '?',
      gameField: state.gameField,
    };
  })
  .onValue(serverPage.setProps.bind(serverPage));

gameState
  .sampledBy(
    firebacon.gameInputStream(gameId),
    function (state, input) { return [gameId, state, input]; }
  )
  .flatMap(ƒ.ply(interpreter.inputsMachine))
  .doAction(_.flow(
    _.bind(_.at, null, _, [0, 1]),
    ƒ.ply(firebacon.setGameState)
  ))
  .doAction(_.flow(
    _.bind(_.at, null, _, [0, 2]),
    ƒ.ply(firebacon.removePlayerInput)
  ))
  .onValue();

var playersStream = firebacon.gamePlayersStream(gameId);

playersStream
  .take(1)
  .filter(_.isNull)
  .map({title: 'waiting players'})
  .onValue(serverPage.setProps.bind(serverPage));

playersStream
  .filter(_.size)
  .map(ƒ.fromKey('players'))
  .onValue(serverPage.setProps.bind(serverPage));
