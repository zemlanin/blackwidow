"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var ƒ = require('./funcy');
var inputs = require('./inputs');

function inputsMachine(gameId, gameState, gameInput) {
  var stateId = _.head(_.keys(gameState));
  var stateObj = _.head(_.values(gameState));
  var inputObj = _.head(_.values(gameInput));

  if (!inputObj) {
    return Bacon.never();
  }

  switch (inputObj.input) {
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

  return [gameId, ƒ.fromKey(stateId, stateObj), gameInput];
}

module.exports = {
  inputsMachine: inputsMachine,
};
