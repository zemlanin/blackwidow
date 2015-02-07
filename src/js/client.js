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

  firebacon
    .getClientStateBus()
    .map(ƒ.fromKey('input'))
    .combine(
      playerStream
        .map(_.keys)
        .map(_.head)
        .map(ƒ.fromKey('playerId')),
      _.assign.bind(null, {})
    )
    .flatMap(firebacon.pushNewGameInput.bind(null, gameId))
    .onValue();

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  );
}
