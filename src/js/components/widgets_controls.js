import _ from 'lodash'
import React from 'react'
const h = React.createElement

class addWidget extends React.Component {
  render () {
    return h('span', {}, 'add')
  }
}

class viewWidget extends React.Component {
  render () {
    const {path: [widgetId], dash} = this.props

    return h('span', {}, JSON.stringify(dash.widgets[widgetId]))
  }
}

export default class widgetsControls extends React.Component {
  render () {
    const {path: [pathHead, ...pathTail], dash} = this.props
    const {send} = this.context

    let route

    if (pathHead === 'add') {
      route = addWidget
    } else if (pathHead === 'view' && pathTail.length) {
      route = viewWidget
    }

    return h('ul',
      {},
      _(dash.widgets)
        .map((widget, widgetId) => h('li', {key: 'w/' + widgetId}, h('a', {onClick: send.bind(null, {action: 'selectWidget', data: widgetId})}, widgetId)))
        // .concat(h('li', {key: 'add'}, h('a', {onClick: send.bind(null, {action: 'addWidget'})}, '+')))
        .value(),
      route ? h(route, {dash, path: pathTail}) : null
    )
  }
}

widgetsControls.contextTypes = {
  send: React.PropTypes.func
}
