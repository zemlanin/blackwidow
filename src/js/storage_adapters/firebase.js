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

function childOnValue(childPath) {
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

function childOnChildAdded(childPath) {
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

function setChildValue(refPath, value) {
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

function pushChildValue(refPath, value) {
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

function getGameStatePath(gameId) {
  return _getGamePath(gameId).child('gameState');
}

function getPlayerPath(gameId, playerId) {
  if (playerId) {
    return _getGamePath(gameId).child('players/' + playerId);
  }

  return _getGamePath(gameId).child('players');
}

function getInputsPath(gameId, inputId) {
  if (inputId) {
    return _getGamePath(gameId).child('gameInput/' + inputId);
  }

  return _getGamePath(gameId).child('gameInput');
}

function setPlayerStatusToOnline(gameId, player) {
  var playerId = _.head(_.keys(player));
  var playerOnlineRef = getPlayerPath(gameId, playerId).child('online');

  setChildValue(playerOnlineRef, true)
    .map(playerOnlineRef)
    .map('.onDisconnect')
    .map('.set', false)
    .onValue();
}

module.exports = {
  childOnValue: childOnValue,
  childOnChildAdded: childOnChildAdded,
  setChildValue: setChildValue,
  pushChildValue: pushChildValue,

  getGameStatePath: getGameStatePath,
  getPlayerPath: getPlayerPath,
  getInputsPath: getInputsPath,

  setPlayerStatusToOnline: setPlayerStatusToOnline,
};
