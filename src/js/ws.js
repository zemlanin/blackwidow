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
    if (retry > 5) {
      wsRegistry[wsUrl] = null
      return null
    }

    var ws = new WebSocket(wsUrl)
    ws.onopen = wsOpen.onNext.bind(wsOpen, ws)
    ws.onclose = _reconnect.bind(ws, (retry ? retry + 1 : 1))
    return ws
  }

  var wsPropertySubj = new Rx.BehaviorSubject(null)
  Rx.Observable.when(
    wsOpen.thenDo(_wsOpenHandler),
    wsClose.thenDo(_wsCloseHandler)
  ).subscribe(wsPropertySubj)

  var wsProperty = wsPropertySubj.share()
  var outgoingStream = new Rx.Subject()
  var incomingStream = wsProperty
    .filter(_.isObject)
    .flatMap((ws) => Rx.Observable.fromEvent(ws, 'message').map(_valuesMapper))
  var connectedProperty = wsProperty
    .map(({readyState}) => readyState === 1)

  ;(function _initWsStream () {
    wsProperty
      .sample(
        outgoingStream
          .pausableBuffered(connectedProperty.map((v) => !v))
          .flatMap(JSON.stringify)
    )
      .map(({send}) => send())
      .subscribe(_.noop)
    wsClose.onNext(null)
  }())

  var result = {
    incomingStream: incomingStream.share(),
    outgoingStream: outgoingStream.share(),
    connectedProperty: connectedProperty.share(),
  }

  wsRegistry[wsUrl] = result
  return result
}

module.exports = {
  getWsStream: getWsStream,
// TODO: close streams
}
