"use strict";

var _ = require('lodash');
var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');
var u = require('./utils');
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
  .filter('.exists')
  .map('.val')
  .map(function (state) {
    return {
      title: state.lastInput ? state.lastInput.input.toString() : '?',
      gameField: state.gameField,
    };
  })
  .onValue(serverPage.setProps.bind(serverPage));

gameState
  .sampledBy(
    firebacon.gameInputStream(gameId).filter('.exists'),
    function (state, input) { return [state, input]; }
  )
  .doAction(u.apply(interpreter.interpretGameInput))
  .doAction(u.apply(interpreter.removeGameInput))
  .onValue();

var playersStream = firebacon.gamePlayersStream(gameId);

playersStream
  .take(1)
  .map('.players')
  .filter(_.isNull)
  .map({title: 'waiting players'})
  .onValue(serverPage.setProps.bind(serverPage));

playersStream
  .filter(_.compose(_.size, _.values))
  .onValue(serverPage.setProps.bind(serverPage));
