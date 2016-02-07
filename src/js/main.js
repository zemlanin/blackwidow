import Rx from 'rx'
import _ from 'lodash'
import { h, render } from 'preact'
import Freezer from 'freezer-js'

import 'whatwg-fetch'

import { getDash } from './store'
import { getWsStream } from './ws'
import { extractEndpointsTo, endpointMapper } from './endpoints'
import Dash from './components/dash'
import controlsInit from './controls'

import 'css/base.css'

const freezer = new Freezer({
  endpoints: {},
  dash: {},
})

getDash()
  .map(extractEndpointsTo(freezer))
  .subscribe((dash) => freezer.get().dash.set(dash))

// freezer.on('update', (u) => { console.log('u', u) })

Rx.Observable.fromEvent(freezer, 'update')
  .pluck('dash')
  .subscribe((dashData) => render(
    h(Dash, dashData),
    document.getElementById('dash'),
    document.getElementById('dash').lastChild
  ))

controlsInit(document.getElementById('controls'), freezer)

var endpoints = Rx.Observable.fromEvent(freezer, 'update')
  .pluck('endpoints')
  .startWith({})
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
  .filter(([ref, endpoint]) => _.get(endpoint, 'schedule.timeInterval'))
  .flatMap(([ref, endpoint]) => Rx.Observable
    .interval(endpoint.schedule.timeInterval * 1000)
    .takeUntil(
      endpoints
        .map(({removed}) => removed[ref])
        .filter((v) => v)
    )
    .map(() => [ref, endpoint])
  )

var websockets = Rx.Observable.fromEvent(freezer, 'update')
  .pluck('endpoints')
  .startWith({})
  .map((es) => _.pickBy(es, (endpoint) => _.has(endpoint, 'ws.url')))
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: _.pick(cur, _.difference(_.keys(cur), _.keys(prev))),
    removed: _.pick(prev, _.difference(_.keys(prev), _.keys(cur))),
  }))

var websocketsAdded = websockets.pluck('added').flatMap(_.toPairs)
var websocketsUpdates = websocketsAdded
  .flatMap(([ref, endpoint]) => getWsStream(endpoint.ws.url)
    .incomingStream
    .filter((msg) => msg.widgetId === endpoint.ws.conds.widgetId)
    .takeUntil(
      websockets.pluck('removed').flatMap(_.keys).filter(_.matches(ref))
    )
    .map(() => [ref, endpoint])
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
  ).then(endpoint.plain ? _.method('text') : _.method('json')))
    .map((response) => ({ref, response}))
    .catch((err) => Rx.Observable.return({err: err}))
  )
  .share()

endpointRequests
  .filter(({response}) => response)
  .map(({ref, response: {ws}}) => ({ref, ws}))
  .filter(({ws}) => ws && ws.url && ws.conds)
  .catch(() => Rx.Observable.empty())
  .subscribe(({ref, ws}) => freezer.get().endpoints[ref].set('ws', ws))

endpointRequests
  .filter(({err}) => !err)
  .flatMap(({ref, response}) => {
    return Rx.Observable.pairs(freezer.get().dash.widgets)
      .filter(([widgetId, widget]) => widget.endpoint && widget.endpoint._ref === ref)
      .map(([widgetId, widget]) => ({widgetId, widget, data: response}))
      .map(({widgetId, widget, data}) => ({
        widgetId,
        data: endpointMapper(data, _.assign({}, widget.data, data), widget.endpoint.map || {}),
      }))
  })
  .subscribe(
    ({widgetId, data}) => freezer.get().dash.widgets[widgetId].set('data', data),
    (error) => console.error(error),
    (v) => console.log('completed')
  )

if (window.castMessageStream) {
  window.castMessageStream
    .filter((msg) => msg === 'refresh')
    .subscribe((msg) => location.reload())
}
