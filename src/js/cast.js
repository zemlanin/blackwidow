'use strict'

import R from 'ramda'
import Rx from 'rx'
import _ from 'lodash'
import {DOM as RxDOM} from 'rx-dom'
import React from 'react'

import {getStream, getDash} from './store'
import Dash from './components/dash'

var dashStore = getStream('dashStore')

getDash()
  .subscribe(dashStore.push)

// dashStore.pull.subscribe(console.log.bind(console, 'dS'))

dashStore.pull
  .subscribe(dashData => React.render(
    React.createElement(Dash, dashData),
    document.getElementById('dash')
  ))

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
    widget.endpoint.schedule
    && widget.endpoint.schedule.type.indexOf('timeInterval') > -1
    && widget.endpoint.schedule.timeInterval
  )
  .flatMap(([widgetId, widget]) => Rx.Observable
    .interval(widget.endpoint.schedule.timeInterval * 1000)
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

function endpointMapper(data, result, mappingFrom, mappingTo) {
  var dataValue

  if (_.isObject(mappingFrom)) {
    if (mappingFrom._path) {
      dataValue = R.path(mappingFrom._path.split('.'), data)
    } else if (_.isString(data)) {
      dataValue = data
    } else {
      dataValue = data[mappingFrom]
    }

    if (mappingFrom._format) {
      dataValue = mappingFrom._format.replace('{}', dataValue)
    }
  } else if (mappingFrom) {
    dataValue = R.path(mappingFrom.split('.'), data)
  } else {
    dataValue = data
  }
  result[mappingTo] = dataValue
  return result
}

endpointRequests
  .flatMap(([widgetId, widget]) => RxDOM.ajax({
      url: widget.endpoint.url,
      responseType: 'text/plain',
      contentType: 'application/json; charset=UTF-8',
      crossDomain: true,
      headers: widget.endpoint.headers,
      method: widget.endpoint.method || 'GET',
    })
    .map(data => widget.endpoint.plain ? data.response : JSON.parse(data.response))
    .filter(r => r)
    .map(data => {
      if (widget.endpoint.map) {
        return _.reduce(
          widget.endpoint.map,
          _.partial(endpointMapper, data),
          _.assign({}, widget.data)
        )
      }

      return _.assign({}, widget.data, data)
    })
    .map(data => ({widgetId, data}))
    .catch(err => Rx.Observable.return(null))
  )
  .filter(r => r)
  .subscribe(
    ({widgetId, data}) => dashStore.push(['widgets', widgetId, 'data'], data),
    error => console.error(error)
  )
