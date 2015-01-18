var _ = require('lodash');
var React = require('react/addons');

var QRCode = React.createFactory(require('qrcode.react'));

var firebacon = require('./firebacon');
var inputs = require('./inputs');

var FullClientPage = React.createClass({
  displayName: 'FullClientPage',

  getInitialState: function () {
    return {}
  },

  _changeText: function (input, event) {
    firebacon.getClientStateBus().push(input);
  },

  render: function () {
    var changeText = _.curry(this._changeText, 2);
    return React.DOM.div({
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
            onClick: changeText(inputs.GAME.LEFT),
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
            onClick: changeText(inputs.GAME.UP),
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
            onClick: changeText(inputs.GAME.RIGHT),
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

  getInitialState: function () {
    return {
      qrDisplayed: false
    };
  },

  toggleQR: function () {
    this.setState({qrDisplayed: !this.state.qrDisplayed});
  },

  render: function () {
    return React.DOM.div(
      null,
      this.props.title ? React.DOM.h1(
        null,
        this.props.title
      ) : null,
      this.props.gameField ? _(this.props.gameField).map(function (value, dim) {
        return React.DOM.span({key: dim}, dim, ': ', value, React.DOM.br())
      }) : null,
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
      React.DOM.span({
          onClick: this.toggleQR,
          className: 'l-box',
          style: {
            color: 'blue',
            cursor: 'pointer',
          },
        },
        this.state.qrDisplayed ? QRCode({value: location.origin + '/' + this.props.gameId}) : 'QR'
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
