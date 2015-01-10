var Bacon = require('baconjs');
var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');
var routing = require('./routing');

var FullClientPage = React.createFactory(components.FullClientPage);
var MagicTitle = React.createFactory(components.MagicTitle);

var gameId = routing.getGameId();
if (gameId) {
  var clickStream = new Bacon.Bus();
  clickStream.onValue(function (value) {
    firebacon.setChildValue('tests/'+gameId, value.newState.buttonText);
  });

  React.render(
    FullClientPage({
      suffix: 'blackwidow',
      clickStream: clickStream,
      gameId: '#'+gameId,
    }),
    document.body
  );
} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  )
}
