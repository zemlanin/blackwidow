"use strict";

var _ = require('lodash');
var React = require('react');

var PlayerBadge = React.createClass({
  displayName: 'PlayerBadge',

  switchController: function (event) {
    this.props.eventStream.push({
      tell: 'switchController',
      event: event,
      playerId: this.props.player.id,
      controllers: !this.props.player.controllers
    });
  },

  render: function () {
    return React.DOM.div(
      null,
      React.DOM.span({
        style: {
          padding: '5px 2px',
          backgroundColor: this.props.player.online ? 'green' : 'red',
          marginRight: 5,
        },
      }),
      React.DOM.span(
        null,
        this.props.player.id
      ),
      React.DOM.span({
          onClick: this.switchController,
          style: {
            padding: '0 5px',
            color: 'blue',
            cursor: 'pointer'
          },
        },
        this.props.player.controllers ? '[ ^ ]' : '[+ =]'
      )
    );
  }
});

var ClosedInfo = React.createClass({
  displayName: 'ClosedInfo',

  inputClickHandler: function (value, event) {
    this.props.eventStream.push({
      tell: 'inputClicked',
      event: event,
      value: value,
    });
  },

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
      this.props.player && this.props.player.controllers ? React.DOM.div({
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
            onClick: this.inputClickHandler.bind(this, 2),
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
            onClick: this.inputClickHandler.bind(this, 0),
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
            onClick: this.inputClickHandler.bind(this, 3),
          },
          '>'
        )
      ) : React.DOM.div({className: 'pure-u-2-5 l-box'}),
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
              style: {color: this.props.player && this.props.player.online ? 'green' : 'red'},
            },
            this.props.player ? '@' + this.props.player.id : ''
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
    return React.DOM.li(
      {key: i},
      React.createElement(
        PlayerBadge,
        {player: player, eventStream: this.props.eventStream}
      )
    );
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
      ['gameId', 'eventStream', 'gameField', 'players']
    );

    return React.DOM.div(
      null,
      React.createElement(OpenedInfo, openedInfoProps),
      React.createElement(ClosedInfo, closedInfoProps)
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

module.exports = {
  FullClientPage: FullClientPage,
  MagicTitle: MagicTitle,
};
