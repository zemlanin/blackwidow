"use strict";

var _ = require('lodash');
var React = require('react/addons');

var components = require('./components');
var routing = require('./routing');
var firebacon = require('./firebacon');
var ƒ = require('./funcy');

var FullClientPage = React.createFactory(components.FullClientPage);
var MagicTitle = React.createFactory(components.MagicTitle);

var gameId = routing.getGameId();
if (gameId) {
  var clientPage = React.render(
    FullClientPage({
      suffix: 'blackwidow',
      gameId: gameId,
    }),
    document.body
  );

  var playerStream = firebacon.connectAsPlayer(gameId).toProperty();
  playerStream
    .map(_.values)
    .map(_.head)
    .map(ƒ.fromKey('player'))
    .onValue(clientPage.setProps.bind(clientPage));

  var playersStream = firebacon.gamePlayersStream(gameId).toProperty();
  playersStream
    .filter(_.size)
    .map(ƒ.fromKey('players'))
    .onValue(clientPage.setProps.bind(clientPage));

  var gameState = firebacon.gameStateStream(gameId).toProperty();

  gameState
    .map(_.bind(_.pick, null, _, 'gameField'))
    .onValue(clientPage.setProps.bind(clientPage));

  firebacon
    .getClientStateBus()
    .map(ƒ.fromKey('value'))
    .combine(
      playerStream
        .map(_.keys)
        .map(_.head)
        .map(ƒ.fromKey('playerId')),
      _.assign.bind(null, {gameId: gameId})
    )
    .map(function (value) {
      value.timeStamp = parseInt(Date.now() / 1000, 10);
      return value;
    })
    .flatMap(firebacon.pushNewGameInput.bind(null))
    .onValue();

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  );
}
