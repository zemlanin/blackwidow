"use strict";

var _ = require('lodash');
var R = require('ramda');
var Bacon = require('baconjs');
var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');
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
  }),
  document.body
);

var gameState = firebacon.gameStateStream(gameId).toProperty();
var playersStream = firebacon.gamePlayersStream(gameId).toProperty();
var inputsStream = firebacon.gameInputStream(gameId);

function debugTicker(value) {
  if (serverPage.state.ticker) {
    return Bacon.once(value)
      .sampledBy(
        Bacon.fromEventTarget(document.getElementById('tick'), 'click')
      )
      .take(1);
  }

  return value;
}

inputsStream
  .map(_.values)
  .map(_.head)
  .scan([], '.concat')
  .flatMap(debugTicker)
  .map(_.bind(_.sortBy, null, _, 'timeStamp'))
  .map(_.bind(_.result, null, _, 'reverse'))
  .map(_.bind(_.pluck, null, _, 'value'))
  .map(R.createMapEntry('inputs'))
  .onValue(serverPage.setProps.bind(serverPage));

Bacon.zipWith(
  _.assign,
  gameState.map(R.createMapEntry('state')),
  playersStream.map(R.createMapEntry('players'))
)
  .sampledBy(
    inputsStream.map(R.createMapEntry('input')),
    _.assign
  )
  .flatMap(debugTicker)
  .flatMap(interpreter.inputsMachine)
  .doAction(_.flow(
    _.partialRight(_.result, 'state'),
    firebacon.setGameState
  ))
  .doAction(_.flow(
    _.partialRight(_.result, 'input'),
    _.keys,
    _.head,
    firebacon.removePlayerInput
  ))
  .onValue();
