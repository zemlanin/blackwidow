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
  var clientPage = React.render(
    FullClientPage({
      suffix: 'blackwidow',
      gameId: gameId,
    }),
    document.body
  );

  var localPlayerId = localStorage.getItem(gameId);
  var playerIdStream;

  if (_.isNull(localPlayerId)) {
    playerIdStream = firebacon.pushChildValue(
      firebacon.getChildPath(gameId).child('players'),
      {
        name: Math.random().toString(16).substring(2),
        online: true,
      }
    ).doAction(localStorage.setItem.bind(localStorage, gameId));
    //localStorage.setItem(gameId, playerId);
  } else {
    playerIdStream = Bacon.once(localPlayerId);
  }

  playerIdStream.onValue(function playerIdStream_onValue (playerId) {
    var playerRef;
    playerRef = firebacon.getChildPath(gameId, playerId);
    firebacon.setChildValue(playerRef.child('online'), true);
    playerRef.child('online').onDisconnect().set(false);

    firebacon.getClientStateBus()
      .map(function (input) {
        return {
          // timestamp: _.now(), // TODO: move timestamp to the server
          input: input,
          playerId: playerId,
        }
      })
      .flatMap(firebacon.pushChildValue.bind(
        null, firebacon.getChildPath(gameId).child('gameInput')
      )).onValue();

    firebacon.childOnValue(playerRef)
      .filter('.exists')
      .map(function (snapshot) {
        return {player: snapshot.val()}
      })
      .onValue(clientPage.setProps.bind(clientPage));
  });

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  )
}
