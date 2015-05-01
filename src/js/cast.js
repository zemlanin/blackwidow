"use strict"

import R from 'ramda'
import _ from 'lodash'
import config from 'config'
import rxcast from './rxcast'

function setHudMessage(elementId, message) {
  document.getElementById(elementId).innerHTML = '' + JSON.stringify(message)
}

if (config.cast.enabled) {
  window.castReceiverManager = null
  window.messageBus = null

  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel[config.cast.logLevel])

  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance()

  var receiverManagerStream = rxcast.streamForReceiverManager(window.castReceiverManager)

  receiverManagerStream
    .filter(R.propEq('type', 'ready'))
    .subscribe(console.log.bind(console, 'ready'))

  receiverManagerStream
    .filter(R.propEq('type', 'senderconnected'))
    .subscribe(function(event) {
      // TODO - add sender and grab CastChannel from CastMessageBus.getCastChannel(senderId)
      var senders = window.castReceiverManager.getSenders()
      console.log('senderconnected', event, senders)
    })

  receiverManagerStream
    .filter(R.propEq('type', 'senderdisconnected'))
    .subscribe(function(event) {
      var senders = window.castReceiverManager.getSenders()

      if (senders.length === 0 && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
        window.close()
      }
    })

  receiverManagerStream
    .filter(R.propEq('type', 'visibilitychanged'))
    .subscribe(function(event) {
      if (event.isVisible) {
        clearTimeout(window.timeout)
        window.timeoutCC = null
      } else {
        window.timeoutCC = setTimeout(function () { window.close() }, 600000) // 10 Minute timeout
      }
    })

  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:blackwidow')
  var messageBusStream = rxcast.streamForMessageBus(window.messageBus)

  messageBusStream
    .subscribe(function(event) {
      setHudMessage('redText', event.data)

      document.getElementById('redText').style.color = _.sample(['white', 'orange', 'yellow', 'green', 'blue'])
    })

  var appConfig = new cast.receiver.CastReceiverManager.Config()
  appConfig.statusText = 'Ready to play'
  appConfig.maxInactivity = 6000
  window.castReceiverManager.start(appConfig)
}
