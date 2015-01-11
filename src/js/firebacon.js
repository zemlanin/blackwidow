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

// TODO: wrap in the Bacon.Bus
function setChildValue(refPath, value) {
  return refPath.set(value)
}

function pushChildValue(refPath, value) {
  return refPath.push(value)
}

function gameInputStream(gameId) {
  return childOnValue(getChildPath(gameId).child('gameInput'));
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
  pushChildValue: pushChildValue,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  gamePlayersStream: gamePlayersStream,
  getChildPath: getChildPath,
  getClientStateBus: getClientStateBus,
}
