'use strict'

import R from 'ramda'
import Rx from 'rx'
import _ from 'lodash'
import {DOM as RxDOM} from 'rx-dom'
import React from 'react'

import {getStream} from './store'
import Dash from './components/dash'
import {getDash} from './storage_adapters/jo'

var dashStore = getStream('dashStore')

getDash()
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

var endpoints = dashStore.pull
  .map(({widgets}) => widgets || {})
  .startWith({})
  .distinctUntilChanged()
  .map(R.pickBy(R.has('endpoint')))
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: R.pick(R.difference(R.keys(cur), R.keys(prev)), cur),
    removed: R.pick(R.difference(R.keys(prev), R.keys(cur)), prev),
  }))

var endpointAdded = endpoints.pluck('added').flatMap(R.toPairs)

var endpointSchedules = endpointAdded
  .filter(([widgetId, widget]) =>
    widget.endpointSchedule
    && widget.endpointSchedule.type.indexOf('timeInterval') > -1
    && widget.endpointSchedule.timeInterval
  )
  .flatMap(([widgetId, widget]) => Rx.Observable.interval(widget.endpointSchedule.timeInterval)
    .takeUntil(
      endpoints
      .map(({removed}) => removed[widgetId])
      .filter(v => v)
    )
    .map([widgetId, widget])
  )

var endpointRequests = Rx.Observable.merge(
  endpointAdded,
  endpointSchedules
)

endpointRequests
  .flatMap(([widgetId, widget]) => RxDOM.ajax({
      url: widget.endpoint,
      responseType: 'text/plain',
      contentType: 'application/json; charset=UTF-8',
      crossDomain: true,
      headers: widget.endpointHeaders,
      method: widget.endpointMethod || 'GET',
    })
    .map(data => JSON.parse(data.response))
    .map(response => widget.endpointPath ? R.path(widget.endpointPath.split('.'), response) : response)
    .filter(r => r)
    .map(data => {
      if (widget.endpointMap) {
        return _.reduce(
          widget.endpointMap,
          (result, v, key) => {
            result[v] = data[key]
            return result
          },
          _.assign({}, widget.data)
        )
      }

      return _.assign({}, widget.data, data)
    })
    .map(data => ({widgetId, data}))
  )
  .subscribe(
    ({widgetId, data}) => dashStore.push(['widgets', widgetId, 'data'], data),
    error => console.error(error)
  )
