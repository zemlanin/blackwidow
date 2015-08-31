'use strict'

import R from 'ramda'
import _ from 'lodash'
import {Subject, BehaviorSubject, Observable} from 'rx'
import {DOM as RxDOM} from 'rx-dom'
import mockDashes from './mockDashes'

function getAjaxSteam(url) {
  return RxDOM.ajax({
      url,
      responseType: 'text/plain',
      contentType: 'application/json; charset=UTF-8',
      crossDomain: true,
    })
    .map(data => JSON.parse(data.response))
}

export function getDash() {
  var id
  var dashStream

  if (location.hash) {
    if (location.hash.match(/^#id[0-9a-f]{1,10}$/i)) {
      id = location.hash.replace(/^#id/, '')
      return Observable.return(mockDashes[id] || mockDashes[0])
    }

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

  if (dashStream) {
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

  return Observable.return(mockDashes[0])
}

function StoreStream(name) {
  var pushStream = new Subject()
  var dataStream = new BehaviorSubject({})

  var dataSubscription = pushStream
    .filter(v => v && v.length === 2)
    .scan({}, (acc, [path, value]) => _.merge(
      acc,
      R.assocPath(path, value, acc)
    ))
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
