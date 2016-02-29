import Rx from 'rx'
import _ from 'lodash'
import { h, render } from 'preact'
import Freezer from 'freezer-js'

import 'whatwg-fetch'

import { getDash } from './store'
import { getWsStream } from './ws'
import { extractEndpoints, endpointMapper, loadExternalWidgets } from './endpoints'
import Dash from './components/dash'
import * as controls from './controls'
import * as github from './github'
import { repeat, diffFrom } from './stream_utils'

import 'css/base.css'

const freezer = new Freezer({
  endpoints: {},
  dash: {},
  controls: {
    opened: false,
  },
  auth: {},
})

window.event$ = new Rx.Subject()

github.init(freezer)

getDash()
  .flatMap(loadExternalWidgets)
  .map(extractEndpoints)
  .subscribe(({dash, endpoints}) => {
    freezer.get().dash.set(dash)

    if (endpoints) { freezer.get().endpoints.set(endpoints) }
  })

// freezer.on('update', (u) => { console.log('u', u) })

Rx.Observable.fromEvent(freezer, 'update')
  .pluck('dash')
  .subscribe((dashData) => render(
    h(Dash, dashData),
    document.getElementById('dash'),
    document.getElementById('dash').lastChild
  ))

controls.init(document.getElementById('controls'), freezer)

const endpoints = diffFrom(freezer, ['endpoints'], 'schedule.timeInterval')
const locals = diffFrom(freezer, ['dash', 'widgets'], 'local.schedule.timeInterval')
const websockets = diffFrom(freezer, ['endpoints'], 'ws.url')

const endpointAdded = endpoints.pluck('added').flatMap(_.toPairs).share()
const localsAdded = locals.pluck('added').flatMap(_.toPairs).share()
const websocketsAdded = websockets.pluck('added').flatMap(_.toPairs).share()

const endpointSchedules = endpointAdded
  .flatMap(([ref, endpoint]) => repeat({
    value: [ref, endpoint],
    each: endpoint.schedule.timeInterval,
    until: endpoints.pluck('removed', ref).filter(_.identity),
  }).skip(1))

const localWidgetUpdates = localsAdded
  .flatMap(([widgetId, widget]) => repeat({
    value: [widgetId, widget],
    each: widget.local.schedule.timeInterval,
    until: locals.pluck('removed', widgetId).filter(_.identity),
  }))
  .map(([widgetId, widget]) => ({
    widgetId: widgetId,
    update: {},
    mapping: widget.local.map,
  }))

const websocketsUpdates = websocketsAdded
  .flatMap(([ref, endpoint]) => getWsStream(endpoint.ws.url)
    .incomingStream
    .filter((msg) => _.isEqual(
      endpoint.ws.conds,
      _.pick(msg, _.keys(endpoint.ws.conds))
    ))
    .takeUntil(websockets.pluck('removed', ref).filter(_.identity))
    .map([ref, endpoint])
  )

const websocketsConnection = websocketsAdded
  .flatMap(([ref, endpoint]) => getWsStream(endpoint.ws.url)
    .connectedProperty
    .map((connected) => ({ref, connected}))
  )

const endpointResponses = Rx.Observable.merge(
  endpointAdded,
  websocketsUpdates,
  endpointSchedules
)
  .flatMap(([ref, endpoint]) => Rx.Observable
    .fromPromise(
      fetch(endpoint.url, {
        headers: endpoint.headers,
        method: endpoint.method || 'GET',
        body: endpoint.body,
      })
      .then(endpoint.plain ? _.method('text') : _.method('json'))
    )
    .map((response) => ({ref, response}))
    .catch((err) => Rx.Observable.return({ref, err}))
  )
  .do(({ref, err}) => {
    if (err) {
      freezer.get().endpoints[ref].set('error', err)
    } else if (freezer.get().endpoints[ref].error) {
      freezer.get().endpoints[ref].remove('error')
    }
  })
  .share()

const endpointWidgetUpdates = endpointResponses
  .filter(({err}) => !err)
  .flatMap(({ref, response}) => Rx.Observable
    .pairs(freezer.get().dash.widgets)
    .filter(([widgetId, widget]) => widget.endpoint && widget.endpoint._ref === ref)
    .map(([widgetId, widget]) => ({
      widgetId: widgetId,
      update: response,
      mapping: widget.endpoint.map,
    }))
  )

websocketsConnection.subscribe(({ref, connected}) => {
  freezer.get().endpoints[ref].ws.set('connected', connected)
})

endpointResponses
  .filter(({err}) => !err)
  .map(({ref, response: {ws}}) => ({ref, ws}))
  .filter(({ws}) => ws && ws.url && ws.conds)
  .catch(() => Rx.Observable.empty())
  .subscribe(({ref, ws}) => {
    freezer.get().endpoints[ref].set('ws', ws)
  })

Rx.Observable.merge(endpointWidgetUpdates, localWidgetUpdates)
  .subscribe(
    ({widgetId, update, mapping}) => {
      const widget = freezer.get().dash.widgets[widgetId]

      widget.set('data', endpointMapper(
        update, widget.data && widget.data.toJS(), mapping
      ))
    },
    (error) => console.error(error),
    (v) => console.log('completed')
  )

if (window.castMessageStream) {
  window.castMessageStream
    .filter((msg) => msg === 'refresh')
    .subscribe((msg) => location.reload())
}
