import _ from 'lodash'
import Rx from 'rx'
import { render, h } from 'preact'

import Controls from './components/controls'

const updates = {
  'updateVisible': ({data}, freezer) => {
    return [freezer.pivot().controls.set('visible', data.visible)]
  },
}

const update = (msg, state) => msg ? updates[msg.action](msg, state) : [state]

export default (node, freezer) => {
  if (!node) { return }

  if (process.env.NODE_ENV === 'production') { return }

  const eventStream = new Rx.Subject()
  const send = (v) => eventStream.onNext(v)
  freezer.get().controls.set('send', send)

  eventStream
    .map((msg) => update(msg, freezer.get()))
    .do(([state, effect]) => effect ? effect(freezer).subscribe(send) : null)
    .map(_.head)
    .startWith(freezer.get())
    .subscribe((state) => render(
      h(Controls, state), node, node.lastChild
    ))

  const mouseMove = Rx.Observable.fromEvent(document.body, 'mousemove').throttle(30)
  const mouseEnter = Rx.Observable.fromEvent(node, 'mouseenter')
  const mouseLeave = Rx.Observable.fromEvent(node, 'mouseleave')

  mouseMove
    .flatMapLatest(() => Rx.Observable.of({visible: false})
      .delay(1000)
      .takeUntil(mouseEnter)
      .startWith({visible: true})
    )
    .pausableBuffered(Rx.Observable.merge(
      mouseEnter.map(false),
      mouseLeave.map(true)
    ).startWith(true))
    .distinctUntilChanged(_.property('visible'))
    .subscribe((data) => send({action: 'updateVisible', data}))
}
