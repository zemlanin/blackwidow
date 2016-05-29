import _ from 'lodash'
import React from 'react'
import {getUrl, catchClick} from '../controls.js'
const h = React.createElement
const BWD_EXAMPLES = process.env.BWD_EXAMPLES

export default class dashboardsControls extends React.Component {
  onExampleClick ({target: {dataset: {example}}}) {
    this.context.send({action: 'selectDash', data: example})
  }
  render () {
    return h('ul',
      {},
      _.map(
        BWD_EXAMPLES,
        (dash, i) => h(
          'li',
          {key: i},
          h('a', {
            // TODO: remove controls=widgets after adding navigation to controls
            href: getUrl({controls: 'widgets', dash: dash.name}),
            dataExample: dash.url,
            onClickCapture: catchClick.bind(this, this.onExampleClick.bind(this))
          }, dash.name || dash.url)
        )
      )
    )
  }
}

dashboardsControls.contextTypes = {
  send: React.PropTypes.func
}
