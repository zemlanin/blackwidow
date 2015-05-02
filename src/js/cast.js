'use strict'

import R from 'ramda'
import React from 'react'
import Dash from './components/dash'
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
  .subscribe(rnd => document.getElementById('redText').childNodes[0].innerHTML = '' + rnd)

React.render(
  React.createFactory(Dash)({
    sizeX: 4,
    sizeY: 4,
    widgets: [
      {position: [0, 0], size: [1, 1], type: 'text', data: {background: 'red'}},
      {position: [1, 0], size: [2, 1], type: 'text', data: {background: 'green'}},
      {position: [0, 1], size: [1, 1], type: 'text', data: {background: 'grey'}},
      {position: [1, 1], size: [1, 2], type: 'text', data: {background: 'blue', text: 'sup'}},
      {position: [2, 1], size: [1, 1], type: 'text', data: {background: 'orange'}},
      {position: [0, 2], size: [1, 1], type: 'text', data: {background: 'magenta'}},
      {position: [2, 2], size: [1, 1], type: 'text', data: {background: 'black', id: 'redText'}},
      {position: [3, 0], size: [1, 4], type: 'text', data: {background: 'maroon'}},
      {position: [0, 3], size: [3, 1], type: 'text', data: {background: 'purple'}},
    ],
  }),
  document.getElementById('dash')
)
