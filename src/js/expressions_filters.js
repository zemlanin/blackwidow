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
filters.head = (v) => _.head(v)
filters.last = (v) => _.last(v)
filters.map = (vs, structure) => vs.map((v) => endpointMapper(v, {}, structure))
filters.format = (v, tmpl) => tmpl.replace(/{([^}]*)}/ig, (match, p1) => p1 ? v[p1] : v)
filters.match = (v, regex, flags) => v.match(new RegExp(regex, flags))
filters.timeUntil = (v, units) => toUnits((new Date(v).getTime() - Date.now()) / 1000, units)
filters.timeSince = (v, units) => toUnits((Date.now() - new Date(v).getTime()) / 1000, units)
filters.juxt = (v, ...structures) => structures.map((structure) => endpointMapper(v, {}, structure))

filters.add = (v, b) => b + v
filters.subtract = (v, b) => b - v
filters.multiply = (v, b) => b * v
filters.divide = (v, b) => b / v

Object.assign(expressions.filters, filters)

export { filters }
