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

function sinkNext(sink, value) {
  sink(new Bacon.Next(_valuesMapper(value)));
}

function sinkError(sink, error) {
  sink(new Bacon.Error(error));
}

function childOnValue(childPath) {
  return Bacon.fromBinder(function (sink) {
    var onSuccess = sinkNext.bind(null, sink);

    childPath.on(
      'value',
      onSuccess,
      sinkError.bind(null, sink)
    );

    return function () {
      childPath.off('value', onSuccess);
    };
  });
}

function childOnChildAdded(childPath) {
  return Bacon.fromBinder(function (sink) {
    var onSuccess = sinkNext.bind(null, sink);

    childPath.on(
      'child_added',
      onSuccess,
      sinkError.bind(null, sink)
    );

    return function () {
      childPath.off('child_added', onSuccess);
    };
  });
}

function getChildPath(gameId, playerId) {
  var childPath;
  if (!gameId) {
    throw Error('gameId is required')
  }

  if (playerId) {
    childPath = firebaseRef.child('tests/' + gameId + '/players/' + playerId);
  } else {
    childPath = firebaseRef.child('tests/' + gameId);
  }

  return childPath;
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

function setPlayerStatusToOnline(gameId, player) {
  var playerId = _.head(_.keys(player));
  var playerOnlineRef = getChildPath(gameId, playerId).child('online');

  setChildValue(playerOnlineRef, true)
    .map(playerOnlineRef)
    .map('.onDisconnect')
    .map('.set', false)
    .onValue();
}

module.exports = {
  childOnValue: childOnValue,
  childOnChildAdded: childOnChildAdded,
  getChildPath: getChildPath,
  setChildValue: setChildValue,
  pushChildValue: pushChildValue,
  setPlayerStatusToOnline: setPlayerStatusToOnline,
};
