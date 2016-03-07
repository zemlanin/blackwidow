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
    const {controls: {path}, dash} = this.props

    return h('span', {}, JSON.stringify(dash.widgets[path[2]]))
  }
}

export default class widgetsControls extends React.Component {
  render () {
    const {controls: {send, path}, dash} = this.props

    let route

    if (path[1] === 'add') {
      route = addWidget
    } else if (path[1] === 'view' && path[2]) {
      route = viewWidget
    }

    return h('ul',
      {},
      _(dash.widgets)
        .map((widget, widgetId) => h('li', {key: 'w/' + widgetId}, h('a', {onClick: send.bind(null, {action: 'selectWidget', data: widgetId})}, widgetId)))
        // .concat(h('li', {key: 'add'}, h('a', {onClick: send.bind(null, {action: 'addWidget'})}, '+')))
        .value(),
      route ? h(route, this.props) : null
    )
  }
}
