"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');

var inputs = require('./inputs');

function inputsMachine(gameId, gameState, gameInput) {
  var state = gameState || {};
  if (!_.isObject(state.gameField)) {
    state.gameField = {x: 0, y: 0};
  }

  var inputObj = _.values(gameInput)[0];

  if (!inputObj) {
    return Bacon.never();
  }

  switch (inputObj.input) {
    case inputs.GAME.UP:
      state.gameField.x++;
      break;
    case inputs.GAME.DOWN:
      state.gameField.x--;
      break;
    case inputs.GAME.LEFT:
      state.gameField.y--;
      break;
    case inputs.GAME.RIGHT:
      state.gameField.y++;
      break;
    // default:
  }

  state.lastInput = inputObj;

  return [gameId, gameState, gameInput];
}

module.exports = {
  inputsMachine: inputsMachine,
};
