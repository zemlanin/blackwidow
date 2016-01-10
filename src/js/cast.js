'use strict'

import Rx from 'rx'

if (cast && !window.castReceiverManager) {
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance()
  window.castMessageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:blackwidow')

  let appConfig = new cast.receiver.CastReceiverManager.Config()
  appConfig.maxInactivity = 60 * 60 * 24 * 31

  window.castReceiverManager.start(appConfig)
}

module.exports = {
  receiverManager: window.castReceiverManager,
  messageBus: window.castMessageBus
                ? Rx.Observable.fromEvent(window.castMessageBus, 'message').map(m => JSON.parse(m.data))
                : null,
}
