var React = require('react/addons');

var firebacon = require('./firebacon');
var components = require('./components');

var MagicTitle = components.MagicTitle;
var valueStream = firebacon.childOnValue('tests/f');

titleComponent = React.render(
  React.createFactory(MagicTitle)(),
  document.getElementsByClassName('wrapper')[0]
);

valueStream.onValue(function (snapshot) {
  titleComponent.setProps({title: snapshot.val()});
});
