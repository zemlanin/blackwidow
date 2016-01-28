'use strict'

import Rx from 'rx'
import _ from 'lodash'
import hash from 'object-hash'
import {DOM as RxDOM} from 'rx-dom'
import React from 'react'
import ReactDOM from 'react-dom'

import {getStream, getDash} from './store'
import {getWsStream} from './ws'
import {messageBus} from './cast'
import Dash from './components/dash'

var dashStore = getStream('dashStore')
var endpointsStore = getStream('endpointsStore')

const extractEndpointsTo = (dest) => (dash) => {
  dash.widgets = _(dash.widgets)
    .mapValues((widget) => {
      if (widget.endpoint && widget.endpoint.url) {
        if (_.isObject(widget.endpoint.body)) {
          widget.endpoint.body = JSON.stringify(widget.endpoint.body)
        }

        const extractedEndpoint = _.pick(widget.endpoint, ['url', 'method', 'body', 'schedule'])
        const endpointHash = hash.MD5(_.pick(widget.endpoint, ['url', 'method', 'body']))

        widget.endpoint.$ref = endpointHash
        widget.endpoint = _.omit(widget.endpoint, _.keys(extractedEndpoint))

        _.delay(endpointsStore.push, 0, endpointHash, extractedEndpoint)
      }

      return widget
    })
    .value()

  return dash
}

getDash()
  .map(extractEndpointsTo(endpointsStore))
  .subscribe(dashStore.push)

// dashStore.pull.subscribe(console.log.bind(console, 'dS'))
// endpointsStore.pull.subscribe(console.log.bind(console, 'eS'))

dashStore.pull
  .subscribe(dashData => ReactDOM.render(
    React.createElement(Dash, dashData),
    document.getElementById('dash')
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
var websocketsRemoved = websockets.pluck('removed').flatMap(_.toPairs)
var websocketsUpdates = websocketsAdded
  .flatMap(([ref, endpoint]) => getWsStream(endpoint.ws.url)
    .incomingStream
    .filter(msg => msg.widgetId === endpoint.ws.conds.widgetId)
    .takeUntil(
      websocketsRemoved.filter(([k, v]) => k === ref)
    )
    .map([ref, endpoint])
  )

var endpointRequests = Rx.Observable.merge(
  endpointAdded,
  websocketsUpdates,
  endpointSchedules
)
  .flatMap(([ref, endpoint]) => RxDOM.ajax({
      url: endpoint.url,
      responseType: 'text/plain',
      contentType: 'application/json; charset=UTF-8',
      crossDomain: true,
      headers: endpoint.headers,
      method: endpoint.method || 'GET',
      body: endpoint.body,
    })
    .map(({response}) => ({ref, response}))
    .catch(err => Rx.Observable.return({err: err}))
  )
  .share()

endpointRequests
  .filter(({response}) => response)
  .map(({ref, response}) => ({ref, ws: JSON.parse(response).ws}))
  .catch(err => Rx.Observable.empty())
  .filter(({ws}) => ws && ws.url && ws.conds)
  .subscribe(({ref, ws}) => endpointsStore.push(`${ref}.ws`, ws))

function endpointMapper(data, result, mappingFrom, mappingTo) {
  var dataValue

  if (_.isObject(mappingFrom)) {
    if (mappingFrom._path) {
      dataValue = _.get(data, mappingFrom._path)
    } else if (_.isString(data)) {
      dataValue = data
    } else {
      dataValue = data[mappingFrom]
    }

    if (mappingFrom._format) {
      dataValue = mappingFrom._format.replace('{}', dataValue)
    }

    if (mappingFrom._parseInt) {
      dataValue = parseInt(dataValue, 10)
    }

    if (mappingFrom._map) {
      dataValue = _.map(
        dataValue,
        v => _.reduce(
          mappingFrom._map,
          _.partial(endpointMapper, v),
          v || {}
        )
      )
    }
  } else if (mappingFrom) {
    dataValue = _.get(data, mappingFrom)
  } else {
    dataValue = data
  }
  result[mappingTo] = dataValue
  return result
}

endpointRequests
  .filter(({err}) => !err)
  .withLatestFrom(dashStore.pull, ({ref, response}, {widgets}) => {
    return Rx.Observable.pairs(widgets)
      .filter(([widgetId, widget]) => widget.endpoint && widget.endpoint.$ref === ref)
      .map(([widgetId, widget]) => ({widgetId, widget, data: widget.endpoint.plain ? response : JSON.parse(response)}))
      .map(({widgetId, widget, data}) => ({
        widgetId,
        data: _.reduce(
          widget.endpoint.map || [],
          _.partial(endpointMapper, data),
          _.assign({}, widget.data, data)
        )
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
