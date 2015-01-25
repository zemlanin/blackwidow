"use strict";

var _ = require('lodash');

var inputs = require('./inputs');
var firebacon = require('./firebacon');

function inputsMachine(gameState, inputObj) {
  var state = gameState.val() || {};
  if (!_.isObject(state.gameField)) {
    state.gameField = {x: 0, y: 0};
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

  firebacon.setChildValue(
    gameState.ref(),
    state
  ).onValue();
}

function interpretGameInput(gameState, gameInput) {
  var inputObj = gameInput.val();
  if (inputObj) {
    inputsMachine(gameState, inputObj);
  }
}

function removeGameInput(gameState, gameInput) {
  firebacon.setChildValue(gameInput.ref(), null).onValue();
}

module.exports = {
  interpretGameInput: interpretGameInput,
  removeGameInput: removeGameInput,
};
