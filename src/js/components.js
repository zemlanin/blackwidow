var _ = require('lodash');
var React = require('react/addons');

var firebacon = require('./firebacon');

var FullClientPage = React.createClass({
  displayName: "FullClientPage",

  baseButtonText: 'hello',

  getInitialState: function () {
    return {buttonText: this.baseButtonText}
  },

  // TODO: move to client.js
  changeText: function (e) {
    if (this.state.buttonText === this.baseButtonText) {
      buttonTextState = {buttonText: this.baseButtonText + ', ' + this.props.suffix};
    } else {
      buttonTextState = {buttonText: this.baseButtonText};
    }

    this.setState(buttonTextState);
    firebacon.getClientStateBus().push(buttonTextState.buttonText);
  },

  render: function () {
    return React.DOM.div({
        className: "pure-g",
        style: {
          margin: '30px auto',
          width: 920,
        },
      },
      React.DOM.div({className: "pure-u-1-5 l-box"}),
      React.DOM.div({
          className: "pure-u-2-5 l-box",
          onClick: this.changeText,
        },
        React.DOM.a({
            className: "pure-u-1 l-bs-box pure-button pure-button-primary button-xlarge",
          },
          this.state.buttonText
        )
      ),
      React.DOM.div({
          className: "pure-u-1-5 l-box",
          style: {
            fontSize: 11,
            color: 'gray',
          }
        },
        React.DOM.p(null,
          '#' + this.props.gameId,
          React.DOM.br(),
          this.props.player ? '@' + this.props.player.name : ''
        )
      )
    );
  }
});

var MagicTitle = React.createClass({
  displayName: 'MagicTitle',
  render: function () {
    return React.DOM.h1(
      null,
      this.props.title
    );
  }
});

var PlayerBadge = React.createClass({
  displayName: 'PlayerBadge',

  render: function () {
    return React.DOM.div(
      null,
      React.DOM.span({
          style: {
            padding: '5px 2px',
            backgroundColor: this.props.online ? 'green' : 'red',
            marginRight: 5,
          },
        },
        ''
      ),
      React.DOM.span(
        null,
        this.props.name
      )
    );
  }
});

var PlayerBadgeFactory = React.createFactory(PlayerBadge);

var FullServerPage = React.createClass({
  displayName: 'FullServerPage',

  render: function () {
    return React.DOM.div(
      null,
      React.DOM.h1(
        null,
        this.props.title
      ),
      React.DOM.a({
          className: 'l-box',
          style: {
            color: 'gray',
          },
          target: '_blank',
          href: '/#' + this.props.gameId,
        },
        this.props.gameId
      ),
      React.DOM.ul({
          style: {
            listStyleType: 'none',
          },
        },
        _(this.props.players).map(function (player, i) {
          return React.DOM.li({key: i}, PlayerBadgeFactory(player))
        })
      )
    );
  }
});

module.exports = {
  FullClientPage: FullClientPage,
  FullServerPage: FullServerPage,
  MagicTitle: MagicTitle,
}
