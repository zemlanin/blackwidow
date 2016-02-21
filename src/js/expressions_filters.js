import _ from 'lodash'
import { endpointMapper } from './endpoints'
import expressions from 'angular-expressions'

function toUnits (seconds, units) {
  switch (units) {
    case 'seconds':
    case 's':
      return parseInt(seconds)
    case 'minutes':
    case 'm':
      return parseInt(seconds / 60)
    case 'hours':
    case 'h':
      return parseInt(seconds / (60 * 60))
    case 'days':
    case 'd':
    default:
      return parseInt(seconds / (60 * 60 * 24))
  }
}

let filters = {}

filters.get = (v, key) => _.get(v, key)
filters.map = (vs, structure) => vs.map((v) => endpointMapper(v, {}, structure))
filters.format = (v, tmpl) => tmpl.replace(/{(\d*)}/ig, (match, p1) => p1 ? v[parseInt(p1, 10)] : v)
filters.match = (v, regex, flags) => v.match(new RegExp(regex, flags))
filters.timeUntil = (v, units) => toUnits((new Date(v).getTime() - Date.now()) / 1000, units)
filters.timeSince = (v, units) => toUnits((Date.now() - new Date(v).getTime()) / 1000, units)
filters.juxt = (v, ...structures) => structures.map((structure) => endpointMapper(v, {}, structure))
filters['+'] = (v, b) => b + v
filters['-'] = (v, b) => b - v

_.assign(expressions.filters, filters)

export { filters }
