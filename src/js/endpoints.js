import _ from 'lodash'
import Rx from 'rx'
import hash from 'object-hash'
import expressions from 'angular-expressions'

import './expressions_filters'
import { getAjaxStream, getGistStream } from './store'

export const extractEndpoints = ({dash}) => {
  let endpoints = []

  dash.widgets = _(dash.widgets)
    .mapValues((widget) => {
      if (widget.endpoint && widget.endpoint.url) {
        if (_.isObject(widget.endpoint.body)) {
          widget.endpoint.body = JSON.stringify(widget.endpoint.body)
        }

        const extractedEndpoint = _.pick(widget.endpoint, ['url', 'method', 'body', 'schedule', 'plain'])
        const endpointHash = hash.MD5(_.pick(widget.endpoint, ['url', 'method', 'body', 'plain']))

        widget.endpoint._ref = endpointHash
        widget.endpoint = _.omit(widget.endpoint, _.keys(extractedEndpoint))

        endpoints[endpointHash] = extractedEndpoint
      }

      return widget
    })
    .value()

  return {dash, endpoints}
}

export const loadExternalWidgets = ({dash}) => {
  return Rx.Observable.from(_.toPairs(dash.widgets))
    .filter(([widgetId, widget]) => widget.src && (widget.src.url || widget.src.gist))
    .flatMap(([widgetId, widget]) => {
      if (widget.src.url) {
        return getAjaxStream(widget.src.url)
          .map((resp) => [widgetId, _.merge(resp, widget)])
      }

      if (widget.src.gist) {
        return getGistStream(widget.src.gist)
          .map((resp) => [widgetId, _.merge(resp, widget)])
      }
    })
    .flatMapObserver(
      (v) => Rx.Observable.of(v),
      (err) => {
        console.error(err)

        return Rx.Observable.empty()
      },
      () => Rx.Observable.empty()
    )
    .do(([widgetId, widget]) => { dash.widgets[widgetId] = widget })
    .startWith(null)
    .takeLast(1)
    .map({dash})
}

export function endpointMapper (data, result, structure) {
  if (_.isString(structure)) {
    return expressions.compile(structure)(_.assign(data, {$: _.cloneDeep(data)}))
  }

  for (let key in structure) {
    result[key] = expressions.compile(
      structure[key]._expr || structure[key]
    )(_.assign(data, structure[key], {$: _.cloneDeep(data)}))
  }

  return result
}
