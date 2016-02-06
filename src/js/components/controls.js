import { h, Component } from 'preact'

import { trigger } from 'css/controls'

const Trigger = () => h('span', {class: trigger}, '=')

export default class Controls extends Component {
  render ({opened, send}) {
    if (!opened || !send) { return h(Trigger) }
  }
}
