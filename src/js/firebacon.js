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
    var ref = firebaseRef.child(childPath);
    var onSuccess = sinkNext.bind(null, sink);

    firebaseRef.child(childPath).on(
      'value',
      onSuccess,
      sinkError.bind(null, sink)
    );

    return function () {
      ref.off('value', onSuccess);
    }
  });
}

// TODO: wrap in the Bacon.Bus
function setChildValue(childPath, value) {
  firebaseRef.child(childPath).set(value)
}

module.exports = {
  childOnValue: childOnValue,
  setChildValue: setChildValue,
}
