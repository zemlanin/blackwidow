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

var clickStream = new Bacon.Bus();
titleComponent = React.render(
  FullServerPage({
    title: 'waiting for players',
    gameId: gameId,
    clickStream: clickStream,
  }),
  document.body
);

clickStream.onValue(function (value) {
  firebacon.setChildValue('tests/'+gameId, null);
  titleComponent.setProps({title: 'session ended'});
});

var valueStream = firebacon.childOnValue('tests/'+gameId);
valueStream.filter(function (snapshot) {
  return snapshot.val() !== null;
}).onValue(function (snapshot) {
  titleComponent.setProps({title: snapshot.val()});
});
