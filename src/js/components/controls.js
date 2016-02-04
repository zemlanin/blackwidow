'use strict'

import {h, Component} from 'preact'

const Trigger = () => h("span", {}, "=")

export default class Controls extends Component {
  render({opened, send}) {
    if (!opened || !send) { return h(Trigger) }
  }
}
