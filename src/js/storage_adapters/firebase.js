"use strict";

var _ = require('lodash');
var Bacon = require('baconjs');
var Firebase = require('firebase');

var firebaseRef = new Firebase("https://blistering-torch-7175.firebaseio.com/");

function deepFreeze(o) {
  var prop, propKey;
  Object.freeze(o);
  for (propKey in o) {
    prop = o[propKey];
    if (!o.hasOwnProperty(propKey) || !(typeof prop === 'object') || Object.isFrozen(prop)) {
      continue;
    }

    deepFreeze(prop);
  }
}

function _valuesMapper(snapshot) {
  var result = {};
  result[snapshot.key()] = snapshot.val();
  deepFreeze(result);
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

function _filterRefBy(ref, field, value) {
  return ref.orderByChild(field).equalTo(value);
}

function pushNewPlayer(player) {
  var gameId = player.gameId;

  if (!gameId) {
    return Bacon.never();
  }

  return _pushChildValue(firebaseRef.child('players'), player);
}

function signConnection(player) {
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
  return _childOnValue(
    _filterRefBy(firebaseRef.child('players'), 'gameId', gameId)
  );
}

function getGameState(gameId) {
  return _childOnValue(
    _filterRefBy(firebaseRef.child('gameState'), 'gameId', gameId).limitToFirst(1)
  );
}

function pushNewGameState(value) {
  return _pushChildValue(firebaseRef.child('gameState'), value);
}

function sendGameState(stateId, value) {
  return _setChildValue(firebaseRef.child('gameState').child(stateId), value);
}

function waitNewGameInputs(gameId) {
  return _childOnChildAdded(
    _filterRefBy(firebaseRef.child('gameInput'), 'gameId', gameId)
  );
}

function sendGameInput(inputId, value) {
  return _setChildValue(firebaseRef.child('gameInput').child(inputId), value);
}

function pushNewGameInput(value) {
  return _pushChildValue(firebaseRef.child('gameInput'), value);
}

module.exports = {
  getPlayer: getPlayer,

  getGamePlayers: getGamePlayers,

  getGameState: getGameState,
  pushNewGameState: pushNewGameState,
  sendGameState: sendGameState,

  waitNewGameInputs: waitNewGameInputs,
  sendGameInput: sendGameInput,
  pushNewGameInput: pushNewGameInput,

  pushNewPlayer: pushNewPlayer,
  signConnection: signConnection,
};
