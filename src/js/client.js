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

  playerStream
    .slidingWindow(2, 2)
    .filter(function (beforeAfter) {
      var before = beforeAfter[0].online;
      var after = beforeAfter[1].online;

      return (!before && after);
    })
    .map('.1')
    .map(R.props(['gameId', 'id']))
    .doAction(R.apply(firebacon.sendCredentials))
    .onValue();

  var playersStream = firebacon.gamePlayersStream(gameId).toProperty();
  playersStream
    .filter(_.size)
    .map(R.pick(['players']))
    .onValue(clientPage.setProps.bind(clientPage));

  var gameState = firebacon.gameStateStream(gameId).toProperty();

  gameState
    .map(R.pick(['gameField']))
    .onValue(clientPage.setProps.bind(clientPage));

  Bacon.constant({gameId: gameId})
    .combine(
      playerStream
        .map('.id')
        .map(R.createMapEntry('playerId')),
      R.merge
    )
    .sampledBy(
      eventStream
        .filter(R.propEq('tell', 'inputClicked'))
        .map(R.pick(['value'])),
      R.merge
    )
    .map(function (value) {
      value.timestamp = parseInt(Date.now() / 1000, 10);
      value.random = Math.random();
      return value;
    })
    .onValue(firebacon.pushNewPlayersInput.bind(null));

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  );
}
