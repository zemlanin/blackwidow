import _ from 'lodash'
import Rx from 'rx'
import React from 'react'
import {render} from 'react-dom'
const h = React.createElement

import Controls from './components/controls'

const TILDA = 96

const updates = {
  controlsToggle: ({data}, freezer) => {
    document.body.classList.toggle('scrollable')

    return [freezer.pivot().controls.set('opened', !freezer.controls.opened)]
  },

  hideCursor: ({data}, freezer) => {
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
    .do(([state, effect]) => effect ? effect(freezer).subscribe(send) : null)
    .map(_.head)
    .merge(Rx.Observable.fromEvent(freezer, 'update'))
    .subscribe((state) => render(
      h(Controls, state), node
    ))

  const controlsToggles$ = Rx.Observable.merge(
    wrapperClick$,
    keypress$.filter((e) => e.keyCode === TILDA)
  )
    .map(null)

  controlsToggles$.subscribe(() => send({action: 'controlsToggle'}))

  const hideCursor$ = mouseMove$
    .flatMapLatest(() => Rx.Observable.of(true).delay(1000).startWith(false))
    .startWith(true)
    .filter(() => !freezer.get().controls.opened)
    .merge(controlsToggles$.map(() => !freezer.get().controls.opened))

  hideCursor$.subscribe((hidden) => send({action: 'hideCursor', data: hidden}))
}
