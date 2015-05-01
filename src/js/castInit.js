"use strict"

import config from 'config'
import {Observable} from 'rx'

function streamForReceiverManager(castReceiverManager) {
  return Observable.merge(
    Observable.fromEvent(castReceiverManager, 'ready'),
    Observable.fromEvent(castReceiverManager, 'senderconnected'),
    Observable.fromEvent(castReceiverManager, 'senderdisconnected'),
    Observable.fromEvent(castReceiverManager, 'visibilitychanged')
  )
}

function streamForMessageBus(messageBus) {
  return Observable.fromEvent(messageBus, 'message')
}

if (config.cast.enabled) {
  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel[config.cast.logLevel])

  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance()
  window.receiverManagerStream = streamForReceiverManager(window.castReceiverManager)
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:blackwidow')
  window.messageBusStream = streamForMessageBus(window.messageBus)

  var appConfig = new cast.receiver.CastReceiverManager.Config()
  appConfig.statusText = 'Ready to play'
  appConfig.maxInactivity = 6000
  window.castReceiverManager.start(appConfig)
}
