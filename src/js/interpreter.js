"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var ƒ = require('./funcy');
var inputs = require('./inputs');

function inputsMachine(data) {
  var stateId = _.head(_.keys(data.state));
  var stateObj = _.cloneDeep(_.head(_.values(data.state)));
  var inputObj = _.head(_.values(data.input));

  if (!inputObj) {
    return Bacon.never();
  }

  switch (inputObj.value) {
    case inputs.GAME.UP:
      stateObj.gameField.x++;
      break;
    case inputs.GAME.DOWN:
      stateObj.gameField.x--;
      break;
    case inputs.GAME.LEFT:
      stateObj.gameField.y--;
      break;
    case inputs.GAME.RIGHT:
      stateObj.gameField.y++;
      break;
    // default:
  }

  stateObj.lastInput = inputObj;

  return _.assign(data, {"state": ƒ.fromKey(stateId, stateObj)});
}

module.exports = {
  inputsMachine: inputsMachine,
};
