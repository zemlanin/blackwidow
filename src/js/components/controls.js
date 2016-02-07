import { h, Component } from 'preact'
import c from 'classnames'

import * as css from 'css/controls'

const Trigger = () => h('div', {class: css.trigger}, '=')

export default class Controls extends Component {
  render ({visible}) {
    return h(
        'div',
        {class: c(css.wrapper, {[css.visible]: visible})},
        h(Trigger)
    )
  }
}
