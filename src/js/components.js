var React = require('react/addons');

var MagicButton = React.createClass({
  displayName: "MagicButton",

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
    return React.DOM.div(
      null,
      React.DOM.div({className: "pure-u-2-5"}),
      React.DOM.div({
          className: "pure-u-1-5 pure-button pure-button-primary button-xlarge",
          onClick: this.changeText,
        },
        this.state.buttonText
      ),
      React.DOM.div({className: "pure-u-2-5"})
    );
  }
});

var MagicTitle = React.createClass({
  displayName: 'MagicTitle',
  render: function () {
    return React.DOM.h1(
      null,
      this.props.title
    )
  }
});

module.exports = {
  MagicButton: MagicButton,
  MagicTitle: MagicTitle,
}
