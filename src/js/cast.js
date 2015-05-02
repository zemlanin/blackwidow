'use strict'

import R from 'ramda'
var {receiverManagerStream, messageBusStream} = window

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
  .filter(R.propEq('reason', cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER))
  .filter(() => window.castReceiverManager.getSenders().length === 0)
  .subscribe(() => window.close())

receiverManagerStream
  .filter(R.propEq('type', 'visibilitychanged'))
  .subscribe(function(event) {
    // TODO: more frp-ish
    if (event.isVisible) {
      clearTimeout(window.timeout)
      window.timeoutCC = null
    } else {
      window.timeoutCC = setTimeout(function () { window.close() }, 600000) // 10 Minute timeout
    }
  })

messageBusStream
  // .doAction(msg => console.log(msg.data))
  .filter(R.propEq('data', 'ping'))
  .map(Math.random)
  .subscribe(rnd => document.getElementById('redText').innerHTML = '' + rnd)
