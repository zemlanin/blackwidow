import _ from 'lodash'
import Rx from 'rx'
import hash from 'object-hash'
import expressions from 'angular-expressions'

import './expressions_filters'
import { getAjaxStream, getGistStream, findJSONFile, findNamedFile } from './store'

export const extractEndpoints = ({dash}) => {
  let endpoints = []

  dash.widgets = _(dash.widgets)
    .mapValues((widget) => {
      if (widget.endpoint && widget.endpoint.url) {
        if (_.isObject(widget.endpoint.body)) {
          widget.endpoint.body = JSON.stringify(widget.endpoint.body)
        }

        const extractedEndpoint = _.pick(widget.endpoint, ['url', 'method', 'body', 'plain', 'schedule', 'headers'])
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
    )(_.assign(update, structure[key]._expr ? structure[key] : null, {$: _.cloneDeep(update)}))
  }

  return result
}

const splitSrc = (src) => {
  if (src.url) {
    return {
      shared: _.pick(src, 'url'),
      local: _.pick(src, 'map'),
    }
  }

  if (src.gist) {
    return {
      shared: _.pick(src, 'gist'),
      local: _.pick(src, 'file', 'map'),
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
            widget: _.merge(endpointMapper(localResp, {}, widget.src.map), widget),
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
