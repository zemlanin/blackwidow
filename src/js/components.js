var React = require('react/addons');

var FullClientPage = React.createClass({
  displayName: "FullClientPage",

  baseButtonText: 'hello',

  getInitialState: function () {
    return {buttonText: this.baseButtonText}
  },

  changeText: function (e) {
    if (this.state.buttonText === this.baseButtonText) {
      buttonTextState = {buttonText: this.baseButtonText + ', ' + this.props.suffix};
    } else {
      buttonTextState = {buttonText: this.baseButtonText};
    }

    this.setState(buttonTextState);
    this.props.clickStream.push({event: e, newState: buttonTextState});
  },

  render: function () {
    return React.DOM.div({
        className: "pure-g",
        style: {
          margin: '30px auto',
          width: 920,
        }
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
            color: 'gray'
          }
        },
        React.DOM.p(null,
          this.props.gameId
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

var FullServerPage = React.createClass({
  displayName: 'FullServerPage',

  endSession: function(event) {
    this.props.clickStream.push();
    this.props.clickStream.end();
  },

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
      this.props.clickStream.ended ? null : React.DOM.span(
        null,
        React.DOM.a({
            className: 'pure-button',
            style: {
              marginTop: 20,
              fontSize: 11,
              color: 'red',
            },
            onClick: this.endSession,
          },
          'end session'
        )
      )
    );
  }
});

module.exports = {
  FullClientPage: FullClientPage,
  FullServerPage: FullServerPage,
  MagicTitle: MagicTitle,
}
