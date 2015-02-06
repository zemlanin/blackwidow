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

function setPlayerStatusToOnline(gameId, player) {
  var playerId = _.head(_.keys(player));
  var playerOnlineRef = getChildPath(gameId, playerId).child('online');

  setChildValue(playerOnlineRef, true)
    .map(playerOnlineRef)
    .map('.onDisconnect')
    .map('.set', false)
    .onValue();
}

function connectAsPlayer(gameId) {
  var localPlayerId = localStorage.getItem(gameId);
  var playerIdStream;

  if (_.isNull(localPlayerId)) {
    playerIdStream = pushNewPlayer(
      gameId,
      {
        name: Math.random().toString(16).substring(2),
        online: true,
      }
    ).doAction(localStorage.setItem.bind(localStorage, gameId));
  } else {
    playerIdStream = Bacon.once(localPlayerId);
  }

  return playerIdStream
    .map(getChildPath.bind(null, gameId))
    .flatMap(childOnValue)
    .take(1)
    .filter(_.flow(_.values, _.any))
    .doAction(setPlayerStatusToOnline.bind(null, gameId));
}

function pushNewPlayerInput(gameId, value) {
  return _pushChildValue(getChildPath(gameId).child('gameInput'), value);
}

function removePlayerInput(gameId, inputIdOrObj) {
  var inputId = _.head(_.keys(inputIdOrObj));

  if (inputId) {
    setChildValue(
      getChildPath(gameId).child('gameInput').child(inputId),
      null
    ).onValue();
  }
}

function gameInputStream(gameId) {
  return childOnChildAdded(getChildPath(gameId).child('gameInput'));
}

function getGameStatePath(gameId) {
  return getChildPath(gameId).child('gameState');
}

function setGameState(gameId, value) {
  setChildValue(getGameStatePath(gameId), value).onValue();
}

function gameStateStream(gameId) {
  return (
    childOnValue(getGameStatePath(gameId))
      .map('.gameState')
  );
}

function gamePlayersStream(gameId) {
  return (
    childOnValue(getChildPath(gameId).child('players'))
      .map('.players')
  );
}

var clientStateBus = new Bacon.Bus();

function getClientStateBus() {
  return clientStateBus;
}

module.exports = {
  connectAsPlayer: connectAsPlayer,
  pushNewPlayerInput: pushNewPlayerInput,
  removePlayerInput: removePlayerInput,
  gameInputStream: gameInputStream,
  gameStateStream: gameStateStream,
  setGameState: setGameState,
  gamePlayersStream: gamePlayersStream,
  getClientStateBus: getClientStateBus,
};
