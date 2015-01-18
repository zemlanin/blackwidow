var _ = require('lodash');
var Bacon = require('baconjs');
var React = require('react/addons');

var components = require('./components');
var routing = require('./routing');
var firebacon = require('./firebacon');

var FullClientPage = React.createFactory(components.FullClientPage);
var MagicTitle = React.createFactory(components.MagicTitle);

var gameId = routing.getGameId();
if (gameId) {
  var playerId = localStorage.getItem(gameId);
  var playerRef;

  if (playerId === null) {
    playerId = firebacon.pushChildValue(
      firebacon.getChildPath(gameId).child('players'),
      {
        name: Math.random().toString(16).substring(2),
        online: true,
      }
    ).key();
    localStorage.setItem(gameId, playerId);
    playerRef = firebacon.getChildPath(gameId, playerId);
  } else {
    playerRef = firebacon.getChildPath(gameId, playerId);
    firebacon.setChildValue(playerRef.child('online'), true);
  }
  playerRef.child('online').onDisconnect().set(false);

  var clientPage = React.render(
    FullClientPage({
      suffix: 'blackwidow',
      gameId: gameId,
    }),
    document.body
  );

  firebacon.getClientStateBus()
    .map(function (input) {
      return {
        // timestamp: _.now(), // TODO: move timestamp to the server
        input: input,
        playerId: playerId,
      }
    })
    .onValue(firebacon.pushChildValue.bind(
      null, firebacon.getChildPath(gameId).child('gameInput')
    ));

  firebacon.childOnValue(playerRef)
    .filter('.exists')
    .map(function (snapshot) {
      return {player: snapshot.val()}
    })
    .onValue(clientPage.setProps.bind(clientPage));

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  )
}
