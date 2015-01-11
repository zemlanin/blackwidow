var _ = require('lodash');
var React = require('react/addons');
var Bacon = require('baconjs');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');
var u = require('./utils');

var FullServerPage = React.createFactory(components.FullServerPage);

var gameId = routing.getGameId();
if (gameId === null) {
  gameId = routing.generateGameId();
  routing.setGameId(gameId);
}

serverPage = React.render(
  FullServerPage({
    gameId: gameId,
    title: '…',
    players: [],
  }),
  document.body
);

var inputStream = (
  firebacon
    .gameInputStream(gameId)
    .map('.val')
    .filter(_.isObject)
    .map(_.values)
    .map('.0.input')
    .doAction(firebacon.setChildValue.bind(
      null, firebacon.getChildPath(gameId).child('gameState')
    ))
    .doAction(firebacon.setChildValue.bind(
      null, firebacon.getChildPath(gameId).child('gameInput'), null
    ))
    .onValue()
);

firebacon
  .gameStateStream(gameId)
  .map('.val')
  .filter(_.isString)
  .map(function (inputData) {
    return {title: inputData};
  })
  .onValue(serverPage.setProps.bind(serverPage));

var playersStream = firebacon.gamePlayersStream(gameId);

playersStream
  .take(1)
  .map('.val')
  .filter(_.isNull)
  .map({title: 'waiting players'})
  .onValue(serverPage.setProps.bind(serverPage));

playersStream
  .map('.val')
  .filter(_.isObject)
  .map(_.values)
  .map(function (players) {
    return {players: players};
  })
  .onValue(serverPage.setProps.bind(serverPage));
