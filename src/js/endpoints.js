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

export function endpointMapper (update, prevData, structure) {
  let result = _.assign({}, prevData, _.isObject(update) ? update : null)

  if (_.isString(structure)) {
    return expressions.compile(structure)(_.assign(update, {$: _.cloneDeep(update)}))
  }

  if (!structure) {
    return result
  }

  for (let key in structure) {
    result[key] = expressions.compile(
      structure[key]._expr || structure[key]
    )(_.assign(update, structure[key], {$: _.cloneDeep(update)}))
  }

  return result
}

export const loadExternalWidgets = ({dash}) => {
  return Rx.Observable.from(_.toPairs(dash.widgets))
    .filter(([widgetId, widget]) => widget.src && (widget.src.url || widget.src.gist))
    .flatMap(([widgetId, widget]) => {
      let externalWidget = Rx.Observable.empty()

      if (widget.src.url) { externalWidget = getAjaxStream(widget.src.url) }
      if (widget.src.gist) { externalWidget = getGistStream(widget.src.gist) }

      return externalWidget.map((resp) => ({
        widgetId,
        widget: _.merge(endpointMapper(resp, {}, widget.src.map), widget),
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
