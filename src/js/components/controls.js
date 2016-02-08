import _ from 'lodash'
import c from 'classnames'
import { h, Component } from 'preact'

import * as css from 'css/controls'

export default class Controls extends Component {
  render ({controls: {visible, opened}, endpoints}) {
    if (!opened && (_(endpoints).pickBy('error').isEmpty() && _(endpoints).pickBy('ws').isEmpty())) {
      return h('div')
    }

    return h(
      'div',
      {class: c(css.wrapper, {[css.visible]: visible, [css.opened]: opened})},
      _(endpoints)
        .pickBy('error')
        .map(({url, error}) => `${url}: ${error}`)
        .value(),
      _(endpoints)
        .pickBy('ws')
        .map('ws')
        .uniqBy('url')
        .map((ws) => {
          return h('div', {class: c(css.ws, {[css.connected]: ws.connected})}, ws.url)
        })
        .value(),
      h('div', {class: css.content},
        h('div', {}, 'opened')
      )
    )
  }
}
