var _ = require('lodash');
var Bacon = require('baconjs');
var Firebase = require('firebase');

var firebaseRef = new Firebase("https://blistering-torch-7175.firebaseio.com/");

function sinkNext(sink, value) {
  sink(new Bacon.Next(value));
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
    }
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
    }
  });
}

// TODO: wrap in the Bacon.Bus
function setChildValue(refPath, value) {
  return refPath.set(value)
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

function pushNewPlayer(gameId, value) {
  return _pushChildValue(getChildPath(gameId).child('players'), value);
}

function pushNewPlayerInput(gameId, value) {
  return _pushChildValue(getChildPath(gameId).child('gameInput'), value);
}

function gameInputStream(gameId) {
  return childOnChildAdded(getChildPath(gameId).child('gameInput'));
}

function gameStateStream(gameId) {
  return childOnValue(getChildPath(gameId).child('gameState'));
}

function gamePlayersStream(gameId) {
  return childOnValue(getChildPath(gameId).child('players'));
}

function getChildPath(gameId, playerId) {
  if (!gameId) {
    throw Error('gameId is required')
  }

  if (playerId) {
    return firebaseRef.child('tests/' + gameId + '/players/' + playerId);
  } else {
    return firebaseRef.child('tests/' + gameId);
  }
}

var clientStateBus = new Bacon.Bus();

function getClientStateBus() {
  return clientStateBus;
}

module.exports = {
  childOnValue: childOnValue,
  setChildValue: setChildValue,
  pushNewPlayer: pushNewPlayer,
  pushNewPlayerInput: pushNewPlayerInput,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  gamePlayersStream: gamePlayersStream,
  getChildPath: getChildPath,
  getClientStateBus: getClientStateBus,
}
