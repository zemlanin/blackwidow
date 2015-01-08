var React = require('react/addons');

var MagicButton = React.createClass({
  displayName: "MagicButton",

  baseButtonText: 'hello',

  getInitialState: function () {
    return {buttonText: this.baseButtonText}
  },

  changeText: function (e){
    if (this.state.buttonText === this.baseButtonText) {
      this.setState({buttonText: this.baseButtonText + ', ' + this.props.suffix});
    } else {
      this.setState({buttonText: this.baseButtonText});
    }
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
  },
});

React.render(
  React.createFactory(MagicButton)({suffix: 'blackwidow'}),
  document.getElementsByClassName('wrapper')[0]
);
