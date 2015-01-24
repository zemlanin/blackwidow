var _ = require('lodash');
var Bacon = require('baconjs');
var React = require('react/addons');

var components = require('./components');
var routing = require('./routing');
var firebacon = require('./firebacon');
var u = require('./utils');

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
    playerIdStream = firebacon.pushNewPlayer(
      gameId,
      {
        name: Math.random().toString(16).substring(2),
        online: true,
      }
    ).doAction(localStorage.setItem.bind(localStorage, gameId));
  } else {
    playerIdStream = Bacon.once(localPlayerId);
  }

  playerIdStream
    .flatMap(firebacon.connectAsPlayer.bind(null, gameId))
    .onValue(u.apply(function playerIdStream_onValue(playerId, playerObj) {
      clientPage.setProps({player: playerObj});

      firebacon.getClientStateBus()
        .map(function (input) {
          return {
            // timestamp: _.now(), // TODO: move timestamp to the server
            input: input,
            playerId: playerId,
          }
        })
        .flatMap(firebacon.pushNewPlayerInput.bind(null, gameId))
        .onValue();
    }));

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  )
}
