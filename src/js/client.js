var Bacon = require('baconjs');
var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');

var clickStream = new Bacon.Bus();

clickStream.onValue(function (value) {
  firebacon.setChildValue('tests/f', value.newState.buttonText);
});

var MagicButton = components.MagicButton;

React.render(
  React.createFactory(MagicButton)({
    suffix: 'blackwidow',
    clickStream: clickStream,
  }),
  document.getElementsByClassName('wrapper')[0]
);
