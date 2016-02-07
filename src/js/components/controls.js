import { h, Component } from 'preact'

import * as css from 'css/controls'

const Trigger = ({visible}) => h('div', {class: css.trigger + (visible ? (' ' + css.visible) : '')}, '=')

export default class Controls extends Component {
  render ({visible}) {
    return h(Trigger, {visible})
  }
}
