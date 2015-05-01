'use strict'

import Bacon from 'baconjs'
import R from 'ramda'

function StoreStream(name) {
  var pushStream = new Bacon.Bus()

  var store = pushStream.scan({}, R.merge)

  this.name = name
  this.pull = store.onValue.bind(store)
  this.push = pushStream.push.bind(pushStream)
}

window.__streamsMap = window.__streamsMap || {}

export function getStream(name) {
  window.__streamsMap[name] = window.__streamsMap[name] || new StoreStream(name)

  return window.__streamsMap[name]
}
