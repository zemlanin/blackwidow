import _ from 'lodash'
import Rx from 'rx'
import { render, h } from 'preact'

import Controls from './components/controls'

const updates = {
  'updateVisible': ({data}, freezer) => {
    return [freezer.set('visible', data.visible)]
  },
}

const update = (msg, state) => msg ? updates[msg.action](msg, state) : [state]

export default (node, freezer) => {
  if (!node) { return }

  if (process.env.NODE_ENV === 'production') { return }

  const eventStream = new Rx.Subject()
  const send = (v) => eventStream.onNext(v)
  freezer.get().set('send', send)

  eventStream
    .map((msg) => update(msg, freezer.get()))
    .do(([state, effect]) => effect ? effect(freezer).subscribe(send) : null)
    .map(_.head)
    .startWith({})
    .subscribe((state) => render(
      h(Controls, state), node, node.lastChild
    ))

  const mouseMove = Rx.Observable.fromEvent(document.body, 'mousemove')
    .throttle(30)
    .flatMapLatest(() => Rx.Observable.of({visible: false})
      .delay(2000)
      .startWith({visible: true})
    )
    .distinctUntilChanged(_.property('visible'))

  mouseMove.subscribe((data) => send({action: 'updateVisible', data}))
}
