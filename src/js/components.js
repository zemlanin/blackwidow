"use strict";

var _ = require('lodash');
var R = require('ramda');
var React = require('react/addons');

var inputs = require('./inputs');

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
      }),
      React.DOM.span(
        null,
        this.props.name
      )
    );
  }
});

var ClosedInfo = React.createClass({
  displayName: 'ClosedInfo',

  inputClickHandler: R.curry(function (value, event) {
    this.props.eventStream.push({
      tell: 'inputClicked',
      event: event,
      value: value,
    });
  }),

  render: function () {
    return React.DOM.div(
      {
        className: 'pure-g',
        style: {
          margin: '30px 0',
          width: '100%',
        },
      },
      React.DOM.div({className: 'pure-u-1-5 l-box'}),
      React.DOM.div({
          className: 'pure-u-2-5 l-box',
          style: {position: 'relative'},
        },
        React.DOM.a({
            className: 'button-error pure-button button-xlarge',
            style: {
              position: 'absolute',
              top: '1em',
              left: '1em',
            },
            onClick: this.inputClickHandler(inputs.GAME.LEFT).bind(this),
          },
          '<'
        ),
        React.DOM.a({
            className: 'pure-button button-xlarge',
            style: {
              position: 'absolute',
              top: '1em',
              left: '50%',
              transform: 'translateX(-50%)'
            },
            onClick: this.inputClickHandler(inputs.GAME.UP).bind(this),
          },
          '^'
        ),
        React.DOM.a({
            className: 'button-success pure-button button-xlarge',
            style: {
              position: 'absolute',
              top: '1em',
              right: '1em',
            },
            onClick: this.inputClickHandler(inputs.GAME.RIGHT).bind(this),
          },
          '>'
        )
      ),
      React.DOM.div({
          className: 'pure-u-1-5 l-box',
          style: {
            fontSize: 11,
            color: 'gray',
          }
        },
        React.DOM.p(null,
          '#' + this.props.gameId,
          React.DOM.br(),
          React.DOM.span({
              style: {color: this.props.connected ? 'green' : 'red'},
            },
            this.props.player ? '@' + this.props.player.name : ''
          )
        )
      )
    );
  }
});

var OpenedInfo = React.createClass({
  displayName: 'OpenedInfo',

  _gameFieldRow: function(value, dim) {
    return React.DOM.span({key: dim}, dim, ': ', value, React.DOM.br());
  },

  _playerBadgeRow: function (player, i) {
    return React.DOM.li({key: i}, React.createElement(PlayerBadge, player));
  },

  render: function () {
    return React.DOM.div(
      null,
      _(this.props.gameField).map(this._gameFieldRow).value(),
      React.DOM.ul({
          style: {
            listStyleType: 'none',
          },
        },
        _(this.props.players).map(this._playerBadgeRow).value()
      )
    );
  }
});

var FullClientPage = React.createClass({
  displayName: 'FullClientPage',

  render: function () {
    var closedInfoProps = _.pick(
      this.props,
      ['gameId', 'eventStream', 'player', 'connected']
    );

    var openedInfoProps = _.pick(
      this.props,
      ['gameId', 'gameField', 'players']
    );

    return React.DOM.div(
      null,
      React.createElement(ClosedInfo, closedInfoProps),
      React.createElement(OpenedInfo, openedInfoProps)
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

var FullServerPage = React.createClass({
  displayName: 'FullServerPage',

  getInitialState: function () {
    return {
      ticker: false,
    };
  },

  toggleTicker: function toggleTicker() {
    this.setState({ticker: !this.state.ticker});
  },

  render: function () {
    return React.DOM.div(
      null,
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
      React.DOM.input({
          type: 'checkbox',
          className: 'l-box',
          checked: this.state.ticker,
          onChange: this.toggleTicker,
        }
      ),
      this.state.ticker ? React.DOM.span({
          id: 'tick',
          className: 'l-box',
          style: {
            color: 'orange',
            cursor: 'pointer',
          },
        },
        'tick'
      ) : null,
      React.DOM.ul(
        null,
        _.map(this.props.inputs, function (input, i) {
          return React.DOM.li({key: i}, input);
        })
      )
    );
  }
});

module.exports = {
  FullClientPage: FullClientPage,
  FullServerPage: FullServerPage,
  MagicTitle: MagicTitle,
};
