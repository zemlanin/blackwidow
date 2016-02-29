import Rx from 'rx'
import _ from 'lodash'

export const diffFrom = (freezer, keys, innerPickBy) => Rx.Observable
  .fromEvent(freezer, 'update')
  .pluck(...keys)
  .map((vs) => _.pickBy(vs, (v) => _.has(v, innerPickBy)))
  .startWith({})
  .bufferWithCount(2, 1)
  .map(([prev, cur]) => ({
    added: _.pick(cur, _.difference(_.keys(cur), _.keys(prev))),
    removed: _.pick(prev, _.difference(_.keys(prev), _.keys(cur))),
  }))

export const repeat = ({value, each, until}) => Rx.Observable
  .interval(each * 1000)
  .startWith(value)
  .takeUntil(until)
  .map(value)
