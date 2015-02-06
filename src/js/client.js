"use strict";

var React = require('react/addons');

var components = require('./components');
var routing = require('./routing');
var firebacon = require('./firebacon');
var funcy = require('./funcy');

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

  firebacon.connectAsPlayer(gameId)
    .onValue(funcy.apply(function playerIdStreamOnValue(playerId, playerObj) {
      clientPage.setProps({player: playerObj});

      firebacon.getClientStateBus()
        .map(function (input) {
          return {
            // timestamp: _.now(), // TODO: move timestamp to the server
            input: input,
            playerId: playerId,
          };
        })
        .flatMap(firebacon.pushNewPlayerInput.bind(null, gameId))
        .onValue();
    }));
} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  );
}
