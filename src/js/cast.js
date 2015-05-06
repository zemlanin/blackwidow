'use strict'

import R from 'ramda'
import Rx from 'rx'
import _ from 'lodash'
import {DOM as RxDOM} from 'rx-dom'
import React from 'react'

import {getStream} from './store'
import Dash from './components/dash'
import {getGoogleApiStream} from './googleApi'
import {getDash, getDashUpdates} from './storage_adapters/jo'

import {redTextUuid} from './storage_adapters/mockDashes'
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
      clearTimeout(window.timeoutCC)
      window.timeoutCC = null
    } else {
      window.timeoutCC = setTimeout(function () { window.close() }, 600000) // 10 Minute timeout
    }
  })

var dashStore = getStream('dashStore')

messageBusStream
  .filter(R.propEq('data', 'ping'))
  .map(Math.random)
  .subscribe(rnd => dashStore.push(['widgets', redTextUuid, 'data', 'text'], '' + rnd))

getDash()
  .merge(getDashUpdates())
  .subscribe(dashStore.push)

// dashStore.pull.subscribe(console.log.bind(console, 'dS'))

var componentStream = dashStore.pull
  .take(1)
  .map(dashData => React.render(
    React.createFactory(Dash)(dashData),
    document.getElementById('dash')
  ))

dashStore.pull
  .skip(1)
  .combineLatest(
    componentStream,
    (dashData, component) => component.setProps(dashData)
  )
  .subscribe()

dashStore.pull
  .map(({widgets}) => widgets || {})
  .startWith({})
  .distinctUntilChanged()
  .map(R.pickBy(R.has('endpoint')))
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: R.pick(R.difference(R.keys(cur), R.keys(prev)), cur),
    removed: R.pick(R.difference(R.keys(prev), R.keys(cur)), prev),
  }))
  .doAction(({removed}) => {/* removed scheduled requests */})
  .map(({added}) => added)
  .flatMap(R.toPairs)
  .flatMap(([widgetId, widget]) => RxDOM.ajax({url: widget.endpoint, responseType: 'text/plain', crossDomain: true})
    .map(data => JSON.parse(data.response))
    .map(response => widget.endpointPath ? R.path(widget.endpointPath.split('.'), response) : response)
    .map(data => {
      if (widget.endpointMap) {
        return _.reduce(
          widget.endpointMap,
          (result, v, key) => {
            result[v] = data[key]
            return result
          },
          {}
        )
      }
      return data
    })
    .map(data => ({widgetId, data}))
  )
  .doAction(console.log.bind(console, 'dS'))
  .subscribe(
    ({widgetId, data}) => dashStore.push(['widgets', widgetId, 'data'], data)
  )

getGoogleApiStream()
  .doAction((gapi) => gapi.client.setApiKey("AIzaSyCuDlL8Dn33UI7DTR7l1R58tAKfN1Jzbf4"))
  .flatMap((gapi) => {
    return Rx.Observable.fromPromise(gapi.auth.authorize({
      'client_id': '6306872097-9d9idvoi2gus40tvmg2tp04lhf3g51hp.apps.googleusercontent.com',
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      immediate: true,
    })).doAction(console.log.bind(console)).map(gapi)
  })
  .subscribe()
