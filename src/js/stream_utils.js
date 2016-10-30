/* @flow */
import Rx from 'rx'
import _ from 'lodash'
import Freezer from 'freezer-js'

export function diffFrom (
  freezer: Freezer<*>,
  keys: string[],
  innerPickBy: (v: any) => boolean
): Rx.Observable {
  return Rx.Observable
    .fromEvent(freezer, 'update')
    .pluck(...keys)
    .map((vs) => _.pickBy(vs, innerPickBy))
    .startWith({})
    .bufferWithCount(2, 1)
    .map(([prev, cur]) => ({
      added: _.pick(cur, _.difference(_.keys(cur), _.keys(prev))),
      removed: _.pick(prev, _.difference(_.keys(prev), _.keys(cur)))
    }))
}

export function repeat (
  {value, each, until}: {value: any, each: number, until: Rx.Observable}
): Rx.Observable {
  return Rx.Observable
    .interval(each * 1000)
    .startWith(value)
    .takeUntil(until)
    .map(value)
}
