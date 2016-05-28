import _ from 'lodash'
import Rx from 'rx'

function _deepFreeze (o) {
  var prop, propKey
  Object.freeze(o)
  for (propKey in o) {
    prop = o[propKey]
    if (!o.hasOwnProperty(propKey) || !_.isObject(prop) || Object.isFrozen(prop)) {
      continue
    }

    _deepFreeze(prop)
  }
}

function _valuesMapper (event) {
  var data = JSON.parse(event.data.replace(/}.*$/, '}'))
  _deepFreeze(data)
  return data
}

var wsRegistry = {}

function getWsStream (wsUrl) {
  if (wsRegistry[wsUrl]) { return wsRegistry[wsUrl] }

  var wsOpen = new Rx.Subject()
  var wsClose = new Rx.Subject()

  function _reconnect (retry) {
    setTimeout(
      wsClose.onNext.bind(wsClose, retry),
      1000 * Math.exp(retry)
    )
  }

  function _wsOpenHandler (ws) {
    ws.onclose = wsClose.onNext.bind(wsClose, null)
    return ws
  }

  function _wsCloseHandler (retry) {
    if (retry > 10) {
      wsRegistry[wsUrl] = null
      return null
    }

    var ws = new WebSocket(wsUrl)
    ws.onopen = wsOpen.onNext.bind(wsOpen, ws)
    ws.onclose = _reconnect.bind(ws, (retry ? retry + 1 : 1))
    return ws
  }

  const wsPropertySubj = new Rx.BehaviorSubject(null)
  Rx.Observable.when(
    wsOpen.thenDo(_wsOpenHandler),
    wsClose.thenDo(_wsCloseHandler)
  ).subscribe(wsPropertySubj)

  const wsProperty = wsPropertySubj.filter(_.identity).share()
  const outgoingStream = new Rx.Subject()
  const incomingStream = wsProperty
    .filter(_.isObject)
    .flatMap((ws) => Rx.Observable.fromEvent(ws, 'message').map(_valuesMapper))
  const connectedProperty = wsProperty
    .map(({readyState}) => readyState === 1)
    .share()

  const pings = Rx.Observable.interval(25000).map({subj: 'ping'})

  ;(function _initWsStream () {
    Rx.Observable.merge(
      outgoingStream.pausableBuffered(connectedProperty),
      pings.pausable(connectedProperty)
    )
      .map(JSON.stringify)
      .combineLatest(wsProperty, (msg, ws) => [ws, msg])
      .filter(([{readyState}, msg]) => readyState === 1)
      .map(([ws, msg]) => ws.send(msg))
      .subscribe(_.noop)
    wsClose.onNext(null)
  }())

  var result = {
    incomingStream: incomingStream.share(),
    outgoingStream: outgoingStream,
    connectedProperty: connectedProperty
  }

  wsRegistry[wsUrl] = result
  return result
}

module.exports = {
  getWsStream: getWsStream
// TODO: close streams
}
