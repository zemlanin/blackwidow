"use strict"

var _ = require('lodash')
var R = require('ramda')
var Bacon = require('baconjs')
var React = require('react')

var components = require('./components')
var routing = require('./routing')
var firebacon = require('./firebacon')
var store = require('./store')

var FullClientPage = React.createFactory(components.FullClientPage)
var MagicTitle = React.createFactory(components.MagicTitle)

var gameId = routing.getGameId()
if (gameId) {
  var eventStream = new Bacon.Bus()
  // eventStream.log();

  var clientPage = React.render(
    FullClientPage({
      gameId: gameId,
      eventStream: eventStream,
    }),
    document.body
  )

  var clientPageStore = store.getStream('clientPage')
  clientPageStore.pull(clientPage.setProps.bind(clientPage))

  var playerStream = firebacon.connectAsPlayer(gameId).toProperty()
  var playersStream = firebacon.gamePlayersStream(gameId)

  playerStream
    .flatMap(function (value) {
      return Bacon.once(value).concat(
        playersStream
        .map(R.prop('players'))
        .map(R.filter(R.propEq('id', value.id)))
        .map('.0')
      )
    })
    .map(R.createMapEntry('player'))
    .onValue(clientPageStore.push)

  playerStream
    .slidingWindow(2, 2)
    .filter(function (beforeAfter) {
      var before = beforeAfter[0].online
      var after = beforeAfter[1].online

      return (!before && after)
    })
    .map('.1')
    .map(R.props(['gameId', 'id']))
    .doAction(R.apply(firebacon.sendCredentials))
    .onValue()

  playersStream
    .filter(_.size)
    .map(R.pick(['players']))
    .onValue(clientPageStore.push)

  var gameState = firebacon.gameStateStream(gameId).toProperty()

  gameState
    .map(R.pick(['gameField']))
    .onValue(clientPageStore.push)

  Bacon.constant({gameId: gameId})
    .sampledBy(
      eventStream
        .filter(R.propEq('tell', 'switchController'))
        .map(R.pick(['playerId', 'controllers'])),
      R.merge
    )
    .onValue(firebacon.switchController.bind(null))

  Bacon.constant({gameId: gameId})
    .combine(
      playerStream
        .map('.id')
        .map(R.createMapEntry('playerId')),
      R.merge
    )
    .sampledBy(
      eventStream
        .filter(R.propEq('tell', 'inputClicked'))
        .map(R.pick(['value'])),
      R.merge
    )
    .map(function (value) {
      value.timestamp = parseInt(Date.now() / 1000, 10)
      value.random = Math.random()
      return value
    })
    .onValue(firebacon.pushNewPlayersInput.bind(null))

} else {
  React.render(
    MagicTitle({title: 'game not found'}),
    document.body
  )
}
