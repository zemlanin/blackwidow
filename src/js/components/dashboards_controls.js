import _ from 'lodash'
import React from 'react'
const h = React.createElement
const BWD_EXAMPLES = process.env.BWD_EXAMPLES

export default class dashboardsControls extends React.Component {
  render () {
    const {send} = this.context

    return h('ul',
      {},
      _(BWD_EXAMPLES)
        .map((example, i) => h(
          'li',
          {key: i},
          h('a', {
            onClick: send.bind(null, {action: 'selectDash', data: example.url})
          }, example.name || example.url)
        ))
        .value()
    )
  }
}

dashboardsControls.contextTypes = {
  send: React.PropTypes.func
}
