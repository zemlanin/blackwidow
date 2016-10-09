import _ from 'lodash'
import Rx from 'rx'
import hash from 'object-hash'
import expressions from 'angular-expressions'

import './expressions_filters'
import { getAjaxStream, getGistStream, findJSONFile, findNamedFile } from './store'
import { getBasicAuthHeader } from './auth'

function extractSharedEndpoint (endpoints, widget) {
  const endpoint = {...widget.endpoint}
  if (widget.endpoint && endpoint.url) {
    if (_.isObject(endpoint.body)) {
      endpoint.body = JSON.stringify(endpoint.body)
    }

    const extractedEndpoint = _.pick(endpoint, ['url', 'method', 'body', 'plain', 'headers', 'auth', 'schedule'])
    const endpointHash = hash.MD5(_.pick(endpoint, ['url', 'method', 'body', 'plain', 'headers', 'auth']))

    endpoints[endpointHash] = extractedEndpoint
    return {
      ...widget,
      endpoint: {
        ..._.omit(widget.endpoint, _.keys(extractedEndpoint)),
        _ref: endpointHash
      }
    }
  }

  return widget
}

function applySharedEndpointsHeaders (endpoints, widget) {
  const extractedEndpoint = (
    widget.endpoint && widget.endpoint._ref && endpoints[widget.endpoint._ref]
  )
  if (extractedEndpoint && extractedEndpoint.headers) {
    let headers = new Headers()
    for (const key in extractedEndpoint.headers) {
      headers.set(key, extractedEndpoint.headers[key])
    }
    extractedEndpoint.headers = headers
  }

  return widget
}

function applySharedEndpointsAuth (endpoints, widget) {
  const extractedEndpoint = (
    widget.endpoint && widget.endpoint._ref && endpoints[widget.endpoint._ref]
  )
  const service = (
    extractedEndpoint && extractedEndpoint.auth && extractedEndpoint.auth.service
  )

  if (!service) { return widget }

  const authHeader = getBasicAuthHeader(service)
  if (authHeader) {
    let headers = extractedEndpoint.headers || new Headers()
    headers.set('Authorization', authHeader)
    extractedEndpoint.headers = headers
  } else {
    widget.error = {
      basicAuthFailed: true,
      service: extractedEndpoint.auth.service
    }
  }

  return widget
}

export const extractEndpoints = ({dash}) => {
  let endpoints = {}
  const widgets = _.mapValues(dash.widgets, _.flow(
    extractSharedEndpoint.bind(null, endpoints),
    applySharedEndpointsHeaders.bind(null, endpoints),
    applySharedEndpointsAuth.bind(null, endpoints)
  ))

  return {
    dash: {...dash, widgets},
    endpoints
  }
}

export function endpointMapper (update, prevData, structure) {
  let result = Object.assign({}, prevData, _.isObject(update) ? update : null)

  if (_.isString(structure)) {
    return expressions.compile(structure)(Object.assign({}, update, {$: _.cloneDeep(update)}))
  }

  if (!structure) {
    return result
  }

  for (let key in structure) {
    result[key] = expressions.compile(
      structure[key]._expr || structure[key]
    )(Object.assign({}, update, structure[key]._expr ? structure[key] : null, {$: _.cloneDeep(update)}))
  }

  return result
}

const splitSrc = (src) => {
  if (src.url) {
    return {
      shared: _.pick(src, 'url'),
      local: _.pick(src, 'map')
    }
  }

  if (src.gist) {
    return {
      shared: _.pick(src, 'gist'),
      local: _.pick(src, 'file', 'map')
    }
  }

  return {}
}

export const loadExternalWidgets = ({dash}) => {
  return Rx.Observable.pairs(dash.widgets)
    .filter(([widgetId, widget]) => widget.src && (widget.src.url || widget.src.gist))
    .reduce((acc, [widgetId, widget]) => {
      const {shared, local} = splitSrc(widget.src)

      if (!shared || !local) { return acc }

      const sharedHash = hash(shared)

      if (!acc[sharedHash]) {
        acc[sharedHash] = {shared, local: []}
      }

      acc[sharedHash].local.push({widgetId, widget})

      return acc
    }, {})
    .flatMap(_.values)
    .flatMap(({shared, local}) => {
      let externalWidget = Rx.Observable.empty()

      if (shared.url) { externalWidget = getAjaxStream(shared.url) }
      if (shared.gist) { externalWidget = getGistStream(shared.gist) }

      return externalWidget
        .flatMap((resp) => local.map(({widgetId, widget}) => {
          let localResp = resp

          if (shared.gist) {
            localResp = JSON.parse(
              widget.src.file
                ? findNamedFile(widget.src.file)(resp).content
                : findJSONFile(resp).content
            )
          }

          return {
            widgetId,
            widget: _.merge({}, endpointMapper(localResp, {}, widget.src.map), widget)
          }
        }))
    })
    .flatMapObserver(
      (v) => Rx.Observable.of(v),
      (err) => {
        console.error(err)

        return Rx.Observable.empty()
      },
      () => Rx.Observable.empty()
    )
    .do(({widgetId, widget}) => { dash.widgets[widgetId] = widget })
    .startWith(null)
    .takeLast(1)
    .map({dash})
}

export const copyLocalWidgets = ({dash}) => {
  dash.widgets = _(dash.widgets)
    .mapValues((widget) => {
      if (widget.src && widget.src.copy) {
        const baseWidget = dash.widgets[widget.src.copy]

        if (!baseWidget) {
          widget.error = `no base widget "${widget.src.copy}"`
          console.error(widget.error)

          return widget
        }

        if (baseWidget.src && baseWidget.src.copy) {
          widget.error = `you can't make copy of copied widget "${widget.src.copy}"`
          console.error(widget.error)

          return widget
        }

        return _.merge({}, baseWidget, widget)
      }

      return widget
    })
    .value()

  return {dash}
}
