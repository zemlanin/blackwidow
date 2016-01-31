'use strict'

import Rx from 'rx'
import _ from 'lodash'
import 'whatwg-fetch'

import {h, render} from 'preact'

import {debug} from 'config'
import {getStream, getDash} from './store'
import {getWsStream} from './ws'
import {messageBus} from './cast'
import {extractEndpointsTo, endpointMapper} from './endpoints'
import Dash from './components/dash'

var dashStore = getStream('dashStore')
var endpointsStore = getStream('endpointsStore')

// dashStore.pull.do(console.log.bind(console, 'dS')).subscribe()
// endpointsStore.pull.do(console.log.bind(console, 'eS')).subscribe()

getDash()
  .map(extractEndpointsTo(endpointsStore))
  .subscribe(dashStore.push)

dashStore.pull
  .subscribe((dashData, i) => render(
    h(Dash, dashData),
    document.getElementById('dash'),
    document.getElementById('dash').lastChild
  ))

var endpoints = endpointsStore.pull
  .map(_.cloneDeep)
  .startWith({})
  // .distinctUntilChanged(hash.MD5)
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: _.pick(cur, _.difference(_.keys(cur), _.keys(prev))),
    removed: _.pick(prev, _.difference(_.keys(prev), _.keys(cur))),
  }))

var endpointAdded = endpoints
  .pluck('added')
  .filter(_.negate(_.isEmpty))
  .flatMap(_.toPairs)
  .share()

var endpointSchedules = endpointAdded
  .filter(([ref, endpoint]) =>
    _.get(endpoint, 'schedule.timeInterval')
  )
  .flatMap(([ref, endpoint]) => Rx.Observable
    .interval(endpoint.schedule.timeInterval * 1000)
    .takeUntil(
      endpoints
      .map(({removed}) => removed[ref])
      .filter(v => v)
    )
    .map([ref, endpoint])
  )

var websockets = endpointsStore.pull
  .map(_.cloneDeep)
  .startWith({})
  .map(es => _.pickBy(es, endpoint => _.has(endpoint, 'ws.url')))
  // .distinctUntilChanged(hash.MD5)
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: _.pick(cur, _.difference(_.keys(cur), _.keys(prev))),
    removed: _.pick(prev, _.difference(_.keys(prev), _.keys(cur))),
  }))

var websocketsAdded = websockets.pluck('added').flatMap(_.toPairs)
var websocketsUpdates = websocketsAdded
  .flatMap(([ref, endpoint]) => getWsStream(endpoint.ws.url)
    .incomingStream
    .filter(msg => msg.widgetId === endpoint.ws.conds.widgetId)
    .takeUntil(
      websockets.pluck('removed').flatMap(_.keys).filter(_.matches(ref))
    )
    .map([ref, endpoint])
  )

var endpointRequests = Rx.Observable.merge(
  endpointAdded,
  websocketsUpdates,
  endpointSchedules
)
  .flatMap(([ref, endpoint]) => Rx.Observable.fromPromise(fetch(
      endpoint.url,
      {
        responseType: 'text/plain',
        contentType: 'application/json; charset=UTF-8',
        crossDomain: true,
        headers: endpoint.headers,
        method: endpoint.method || 'GET',
        body: endpoint.body,
      }
    ))
    .flatMap((response) => Rx.Observable.fromPromise(endpoint.plain ? response.text() : response.json()))
    .map((response) => ({ref, response}))
    .catch(err => Rx.Observable.return({err: err}))
  )
  .share()

endpointRequests
  .filter(({response}) => response)
  .filter(({ws}) => ws && ws.url && ws.conds)
  .map(({ref, response: {ws}}) => ({ref, ws}))
  .catch(err => Rx.Observable.empty())
  .subscribe(({ref, ws}) => endpointsStore.push(`${ref}.ws`, ws))

endpointRequests
  .filter(({err}) => !err)
  .withLatestFrom(dashStore.pull, ({ref, response}, {widgets}) => {
    return Rx.Observable.pairs(widgets)
      .filter(([widgetId, widget]) => widget.endpoint && widget.endpoint._ref === ref)
      .map(([widgetId, widget]) => ({widgetId, widget, data: response}))
      .map(({widgetId, widget, data}) => ({
        widgetId,
        data: endpointMapper(data, _.assign({}, widget.data, data), widget.endpoint.map || {}),
      }))
  })
  .mergeAll()
  .subscribe(
    ({widgetId, data}) => dashStore.push(`widgets.${widgetId}.data`, data),
    error => console.error(error),
    v => console.log('completed')
  )

if (messageBus) {
  messageBus
    .filter(msg => msg === 'refresh')
    .subscribe(msg => location.reload())
}

if (debug) {
  console.log(endpointMapper({"text": "2015-09-13"}, {}, {
    "text": "text | match:'\\\\d{4}-(\\\\d{2})-(\\\\d{2})' | format:'{2}.{1}'"
  }))
  console.log(endpointMapper({"text": "Mal|Zoe|Wash"}, {}, {
    "values": {
      "_expr": "text | match:'[a-z]+':'ig' | map:_map",
      "_map": {"value": "$"}
    }
  }))
  console.log(endpointMapper({project: {rev: "15.9.13(154321)a9324a63ed24"}}, {}, {
    "text": "project.rev | match:'(.*)\\\\((.*)\\\\)' | format:'{1} /{2}'"
  }))
}
