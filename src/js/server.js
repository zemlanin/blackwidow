var _ = require('lodash');
var React = require('react/addons');
var Bacon = require('baconjs');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');

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

firebacon
  .gameInputStream(gameId)
  .filter(function (snapshot) {
    return snapshot.val() !== null;
  })
  .map(function (snapshot) {
    return {title: snapshot.val()}
  })
  .onValue(serverPage.setProps.bind(serverPage));

var playersStream = firebacon.gamePlayersStream(gameId);

playersStream
  .take(1)
  .filter(function (snapshot) {
    return snapshot.val() === null;
  })
  .map({title: 'waiting players'})
  .onValue(serverPage.setProps.bind(serverPage));

playersStream
  .filter(function (snapshot) {
    return snapshot.val() !== null;
  })
  .map(function (snapshot) {
    return {players: _.values(snapshot.val())}
  })
  .onValue(serverPage.setProps.bind(serverPage));
