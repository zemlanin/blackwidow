'use strict'

import React from 'react'
import {propEq} from 'ramda'

import {getStream} from './store'
import Dash from './components/dash'
import {getDash, getDashUpdates} from './storage_adapters/jo'

import {redTextUuid} from './storage_adapters/mockDashes'
var {receiverManagerStream, messageBusStream} = window

receiverManagerStream
  .filter(propEq('type', 'ready'))
  .subscribe(console.log.bind(console, 'ready'))

receiverManagerStream
  .filter(propEq('type', 'senderconnected'))
  .subscribe(function(event) {
    // TODO - add sender and grab CastChannel from CastMessageBus.getCastChannel(senderId)
    var senders = window.castReceiverManager.getSenders()
    console.log('senderconnected', event, senders)
  })

receiverManagerStream
  .filter(propEq('type', 'senderdisconnected'))
  .filter(propEq('reason', cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER))
  .filter(() => window.castReceiverManager.getSenders().length === 0)
  .subscribe(() => window.close())

receiverManagerStream
  .filter(propEq('type', 'visibilitychanged'))
  .subscribe(function(event) {
    // TODO: more frp-ish
    if (event.isVisible) {
      clearTimeout(window.timeoutCC)
      window.timeoutCC = null
    } else {
      window.timeoutCC = setTimeout(function () { window.close() }, 600000) // 10 Minute timeout
    }
  })

var dashStore = getStream('dashStore')

messageBusStream
  .filter(propEq('data', 'ping'))
  .map(Math.random)
  .subscribe(rnd => dashStore.push(['widgets', redTextUuid, 'data', 'text'], '' + rnd))

getDash()
  .merge(getDashUpdates())
  .subscribe(dashStore.push)

// dashStore.pull.subscribe(console.log.bind(console, 'dS'))

var componentStream = dashStore.pull
  .map(dashData => React.render(
    React.createFactory(Dash)(dashData),
    document.getElementById('dash')
  ))

dashStore.pull
  .combineLatest(
    componentStream,
    (dashData, component) => component.setProps(dashData)
  )
  .subscribe()
