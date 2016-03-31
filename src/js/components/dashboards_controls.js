import _ from 'lodash'
import React from 'react'
const h = React.createElement
import * as config from 'config'

export default class dashboardsControls extends React.Component {
  render () {
    const {controls: {send}} = this.props

    return h('ul',
      {},
      _(config.examples)
        .map((example, i) => h(
          'li',
          {key: i},
          h('a', {
            onClick: send.bind(null, {action: 'selectDash', data: example.url}),
          }, example.name || example.url)
        ))
        .value()
    )
  }
}
