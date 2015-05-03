"use strict"

import {assoc} from 'ramda'
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

var launchedOnCrKey = !!window.navigator.userAgent.match('CrKey')

if (launchedOnCrKey) {
  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel[config.cast.logLevel])

  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance()
  window.receiverManagerStream = streamForReceiverManager(window.castReceiverManager)
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:blackwidow')
  window.messageBusStream = Observable.fromEvent(window.messageBus, 'message')
    .map(msg => assoc('data', JSON.parse(msg.data), msg))

  var appConfig = new cast.receiver.CastReceiverManager.Config()
  appConfig.statusText = 'Ready to play'
  appConfig.maxInactivity = 6000
  window.castReceiverManager.start(appConfig)
} else {
  var pingButton = document.createElement('button')
  pingButton.textContent = 'ping'

  var updateDashButton = document.createElement('button')
  updateDashButton.textContent = 'update'

  window.messageBusStream = Observable.merge(
    Observable.fromEvent(pingButton, 'click')
      .map({"data": "ping"}),
    Observable.fromEvent(updateDashButton, 'click')
      .map((ev, index) => ({"data": {"type": "update", "id": (index+1) % 3}}))
  )
  window.receiverManagerStream = Observable.create(obs => {
    obs.onNext({"type": "ready"})
    obs.onCompleted()
  })

  if (config.debug) {
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById('debug').appendChild(pingButton)
      document.getElementById('debug').appendChild(updateDashButton)
      document.getElementById('debug').style.display = 'block'

      document.getElementById('dash').style.height = '78vh'
    })
  }
}
