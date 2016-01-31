'use strict'

import Rx from 'rx'
import _ from 'lodash'
import {Subject, BehaviorSubject, Observable} from 'rx'

function getAjaxSteam(url) {
  return Rx.Observable.fromPromise(fetch(
      url,
      {
        responseType: 'text/plain',
        contentType: 'application/json; charset=UTF-8',
        crossDomain: true,
      }
    ))
    .flatMap((response) => Rx.Observable.fromPromise(response.json()))
}

export function getDash() {
  var dashStream

  if (location.hash && location.hash.match(/^#(https?|file):/)) {
    if (location.hash.match(/^#(https?|file):/)) {
      let url = location.hash.replace(/^#/, '')
      dashStream = getAjaxSteam(url)
    }
  }

  if (location.search.match(/[?&]gist=([0-9a-f]+)/i)) {
    let gistId = location.search.match(/[?&]gist=([0-9a-f]+)/i)[1]
    dashStream = getAjaxSteam(`https://api.github.com/gists/${gistId}`)
      .pluck('files')
      .map(files => _.find(files, file => file.language === 'JSON'))
      .map(file => JSON.parse(file.content))
  }

  if (!dashStream) {
    dashStream = getAjaxSteam('./examples/mockDashes.json')
  }

  return dashStream
    .catch(err => Observable.return({
      "widgets": {
        "error": {
          "type": "text",
          "container": {
            "position": [0, 0],
            "size": [10, 10],
            "background": "red",
          },
          "data": {"text": err.message},
        },
      },
    }))
}

function StoreStream(name) {
  var pushStream = new Subject()
  var dataStream = new BehaviorSubject({})

  var dataSubscription = pushStream
    .filter(v => v && v.length === 2)
    .scan({}, (acc, [path, value]) => _.merge(
      acc,
      _.set({}, path, value)
    ))
    .map(_.cloneDeep)
    .subscribe(dataStream)

  this.name = name
  this.pull = dataStream
  this.push = (path, value) => {
    if (value === undefined) {
      _.forEach(
        path,
        (v, key) => pushStream.onNext([[key], v])
      )
    } else {
      pushStream.onNext([path, value])
    }
  }
  this.dispose = dataSubscription.dispose.bind(dataSubscription)
}

window.__streamsMap = window.__streamsMap || {}

export function getStream(name) {
  window.__streamsMap[name] = window.__streamsMap[name] || new StoreStream(name)

  return window.__streamsMap[name]
}
