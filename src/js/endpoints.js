import _ from 'lodash'
import hash from 'object-hash'
import expressions from 'angular-expressions'

export const extractEndpointsTo = (dest) => (dash) => {
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

        _.delay(dest.push, 0, endpointHash, extractedEndpoint)
      }

      return widget
    })
    .value()

  return dash
}

export function endpointMapper (data, result, structure) {
  // console.log(data, result)

  for (let key in structure) {
    result[key] = expressions.compile(
      structure[key]._expr || structure[key]
    )(_.assign(data, structure[key], {$: data}))
  }

  return result
}

expressions.filters.get = (v, key) => _.get(v, key)
expressions.filters.map = (vs, structure) => vs.map((v) => endpointMapper(v, {}, structure))
expressions.filters.format = (v, tmpl) => {
  return tmpl.replace(/{(\d*)}/ig, (match, p1) => p1 ? v[parseInt(p1, 10)] : v)
}
expressions.filters.match = (v, regex, flags) => v.match(new RegExp(regex, flags))
