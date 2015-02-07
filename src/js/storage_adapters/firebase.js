"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');
var Firebase = require('firebase');

var firebaseRef = new Firebase("https://blistering-torch-7175.firebaseio.com/");

function _valuesMapper(snapshot) {
  var result = {};
  result[snapshot.key()] = snapshot.val();
  return result;
}

function _sinkNext(sink, value) {
  sink(new Bacon.Next(_valuesMapper(value)));
}

function _sinkError(sink, error) {
  sink(new Bacon.Error(error));
}

function _childOnValue(childPath) {
  return Bacon.fromBinder(function (sink) {
    var onSuccess = _sinkNext.bind(null, sink);

    childPath.on(
      'value',
      onSuccess,
      _sinkError.bind(null, sink)
    );

    return function () {
      childPath.off('value', onSuccess);
    };
  });
}

function _childOnChildAdded(childPath) {
  return Bacon.fromBinder(function (sink) {
    var onSuccess = _sinkNext.bind(null, sink);

    childPath.on(
      'child_added',
      onSuccess,
      _sinkError.bind(null, sink)
    );

    return function () {
      childPath.off('child_added', onSuccess);
    };
  });
}

function _setChildValue(refPath, value) {
  return Bacon.fromBinder(function _pushChildValueBinder(sink) {
    refPath.set(value, function (err) {
      if (_.isNull(err)) {
        sink(new Bacon.Next());
      } else {
        sink(new Bacon.Error(err));
      }
      sink(new Bacon.End());
    });
  });
}

function _pushChildValue(refPath, value) {
  return Bacon.fromBinder(function _pushChildValueBinder(sink) {
    var newValueRef = refPath.push();

    newValueRef.set(value, function (err) {
      if (_.isNull(err)) {
        sink(new Bacon.Next(newValueRef.key()));
      } else {
        sink(new Bacon.Error(err));
      }
      sink(new Bacon.End());
    });
  });
}

function _getGamePath(gameId) {
  return firebaseRef.child('tests/' + gameId);
}

function pushNewPlayer(player) {
  var gameId = player.gameId;

  if (!gameId) {
    return Bacon.never();
  }

  return _pushChildValue(firebaseRef.child('players'), player);
}

function setPlayerStatusToOnline(gameId, player) {
  var playerId = _.head(_.keys(player));
  var playerOnlineRef = firebaseRef
    .child('players')
    .child(playerId)
    .child('online');

  _setChildValue(playerOnlineRef, true)
    .map(playerOnlineRef)
    .map('.onDisconnect')
    .map('.set', false)
    .onValue();
}

function getPlayer(playerId) {
  return _childOnValue(firebaseRef.child('players').child(playerId));
}

function getGamePlayers(gameId) {
  return _childOnValue(firebaseRef.child('players').orderByChild('gameId').equalTo(gameId));
}

function getGameState(gameId) {
  return _childOnValue(_getGamePath(gameId).child('gameState'));
}

function sendGameState(gameId, value) {
  return _setChildValue(_getGamePath(gameId).child('gameState'), value);
}

function waitNewGameInputs(gameId) {
  return _childOnChildAdded(_getGamePath(gameId).child('gameInput'));
}

function sendGameInput(gameId, inputId, value) {
  return _setChildValue(_getGamePath(gameId).child('gameInput').child(inputId), value);
}

function pushNewGameInput(gameId, value) {
  return _pushChildValue(_getGamePath(gameId).child('gameInput'), value);
}

module.exports = {
  getPlayer: getPlayer,

  getGamePlayers: getGamePlayers,

  getGameState: getGameState,
  sendGameState: sendGameState,

  waitNewGameInputs: waitNewGameInputs,
  sendGameInput: sendGameInput,
  pushNewGameInput: pushNewGameInput,

  pushNewPlayer: pushNewPlayer,
  setPlayerStatusToOnline: setPlayerStatusToOnline,
};
