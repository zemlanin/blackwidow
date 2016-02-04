'use strict'

import _ from 'lodash'
import Rx from 'rx'
import {render, h} from 'preact'

import Controls from './components/controls'

const updates = {
}

const update = (msg, state) => msg ? updates[msg.action](msg, state) : [state]

export default (node, freezer) => {
  if (!node) { return }

  const eventStream = new Rx.Subject()
  const send = (v) => eventStream.onNext(v)
  freezer.set('send', send)

  eventStream
    .map((msg) => update(msg, freezer.get()))
    .do(([state, effect]) => effect ? effect(freezer).subscribe(send) : null)
    .map(_.head)
    .subscribe(state => render(
      h(Controls, state), node, node.lastChild
    ))
}
