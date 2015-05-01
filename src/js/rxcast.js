/*eslint semi: [2, "never"] */

'use strict'

var Rx = require('rx')

function streamForReceiverManager(castReceiverManager) {
  return Rx.Observable.merge(
    Rx.Observable.fromEvent(castReceiverManager, 'ready'),
    Rx.Observable.fromEvent(castReceiverManager, 'senderconnected'),
    Rx.Observable.fromEvent(castReceiverManager, 'senderdisconnected'),
    Rx.Observable.fromEvent(castReceiverManager, 'visibilitychanged')
  )
}

function streamForMessageBus(messageBus) {
  return Rx.Observable.fromEvent(messageBus, 'message')
}

module.exports = {
  streamForReceiverManager: streamForReceiverManager,
  streamForMessageBus: streamForMessageBus,
}
