import _ from 'lodash'
import Rx from 'rx'
import React from 'react'
import queryString from 'query-string'
import {render} from 'react-dom'
const h = React.createElement

import Controls from './components/controls'

const TILDA = 96

export function getUrl (searchObj) {
  return (
    '?' +
    queryString.stringify(Object.assign(
      queryString.parse(location.search),
      searchObj
    )) +
    location.hash
  )
}

const updates = {
  controlsToggle: ({data}, freezer) => {
    document.body.classList.toggle('scrollable')

    return [freezer.pivot().controls.set('opened', !freezer.controls.opened)]
  },

  cursorToggle: ({data}, freezer) => {
    if (data) {
      document.body.classList.add('no-cursor')
    } else {
      document.body.classList.remove('no-cursor')
    }

    return [freezer]
  },

  githubLogout: ({data}, freezer) => {
    localStorage.removeItem('github:token')

    return [freezer.pivot().auth.remove('github')]
  },

  showDashboards: ({data}, freezer) => {
    return [
      freezer,
      () => Rx.Observable.of({action: 'open', data: {url: getUrl({controls: 'dashboards'})}}),
      () => Rx.Observable.of({action: 'controlsToggle'}),
      () => Rx.Observable.of({action: 'cursorToggle'})
    ]
  },

  selectDash: ({data}, freezer) => {
    return [
      freezer,
      () => Rx.Observable.of({action: 'controlsToggle'})
    ]
  },

  open: ({data: {url}}, freezer) => {
    history.pushState({}, '', url)
    const controlsPath = queryString.parse(location.search).controls
    const path = controlsPath
      ? decodeURIComponent(controlsPath).split('/')
      : 'widgets'
    return [freezer.pivot().controls.set('path', path)]
  }
}

const update = (msg, state) => msg ? updates[msg.action](msg, state) : [state]

const wrapperClick$ = Rx.Observable.fromEvent(document.getElementById('wrapper'), 'click')
const keypress$ = Rx.Observable.fromEvent(document.body, 'keypress')
const mouseMove$ = Rx.Observable.fromEvent(document.body, 'mousemove').throttle(30)

export const init = (node, freezer) => {
  if (!node) { return }

  const send = (v) => window.event$.onNext(v)
  freezer.get().controls.set('send', send)

  window.event$
    .map((msg) => update(msg, freezer.get()))
    .do(([state, ...effects]) => effects.map((effect) => effect(freezer).subscribe(send)))
    .map(_.head)
    .merge(Rx.Observable.fromEvent(freezer, 'update'))
    .subscribe((state) => render(
      h(Controls, state.toJS()), node
    ))

  const controlsToggles$ = Rx.Observable.merge(
    wrapperClick$,
    keypress$.filter((e) => e.keyCode === TILDA)
  )
    .map(null)

  controlsToggles$.subscribe(() => send({action: 'controlsToggle'}))

  const cursorToggle$ = mouseMove$
    .flatMapLatest(() => Rx.Observable.of(true).delay(1000).startWith(false))
    .startWith(true)
    .filter(() => !freezer.get().controls.opened)
    .merge(controlsToggles$.map(() => !freezer.get().controls.opened))

  cursorToggle$.subscribe((hidden) => send({action: 'cursorToggle', data: hidden}))
}

export function catchClick (callback, event) {
  if (typeof callback === 'function') {
    callback(event)
  } else {
    event = callback
  }

  event.preventDefault()
  window.event$.onNext({action: 'open', data: {url: event.target.href}})
}
