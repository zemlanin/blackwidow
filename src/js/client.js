"use strict";

var _ = require('lodash');
var R = require('ramda');
var Bacon = require('baconjs');
var React = require('react');

var components = require('./components');
var routing = require('./routing');
var firebacon = require('./firebacon');

var FullClientPage = React.createFactory(components.FullClientPage);
var MagicTitle = React.createFactory(components.MagicTitle);

var gameId = routing.getGameId();
if (gameId) {
  var eventStream = new Bacon.Bus();
  // eventStream.log();

  var clientPage = React.render(
    FullClientPage({
      gameId: gameId,
      eventStream: eventStream,
    }),
    document.body
  );

  var playerStream = firebacon.connectAsPlayer(gameId).toProperty();
  playerStream
    .map(R.createMapEntry('player'))
    .onValue(clientPage.setProps.bind(clientPage));

  firebacon.connectedProperty
    .map(R.createMapEntry('connected'))
    .onValue(clientPage.setProps.bind(clientPage));

  var playersStream = firebacon.gamePlayersStream(gameId).toProperty();
  playersStream
    .filter(_.size)
    .map(R.createMapEntry('players'))
    .onValue(clientPage.setProps.bind(clientPage));

  var gameState = firebacon.gameStateStream(gameId).toProperty();

  gameState
    .map(R.pick(['gameField']))
    .onValue(clientPage.setProps.bind(clientPage));

  eventStream
    .filter(R.propEq('tell', 'inputClicked'))
    .map(R.pick(['value']))
    .combine(
      playerStream
        .map('.player')
        .map(R.pick(['playerId'])),
      _.assign.bind(null, {gameId: gameId})
    )
    .map(function (value) {
      value.timeStamp = parseInt(Date.now() / 1000, 10);
      return value;
    })
    .onValue(firebacon.pushNewPlayersInput.bind(null));

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  );
}
