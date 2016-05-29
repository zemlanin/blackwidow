import _ from 'lodash'
import React from 'react'
import {getUrl, catchClick} from '../controls.js'
const h = React.createElement

class addWidget extends React.Component {
  render () {
    return h('span', {}, 'add')
  }
}

class viewWidget extends React.Component {
  render () {
    const {path: [widgetId], dash} = this.props

    if (!widgetId || !dash.widgets) { return null }

    return h('span', {}, JSON.stringify(dash.widgets[widgetId]))
  }
}

export default class widgetsControls extends React.Component {
  render () {
    const {path: [pathHead, ...pathTail], dash} = this.props

    let route

    if (pathHead === 'add') {
      route = addWidget
    } else if (pathHead === 'view' && pathTail.length) {
      route = viewWidget
    }

    return h('ul',
      {},
      _.map(
        dash.widgets,
        (widget, widgetId) => h(
          'li',
          {key: 'w/' + widgetId},
          h(
            'a',
            {href: getUrl({controls: `widgets/view/${widgetId}`}), onClickCapture: catchClick},
            widgetId
          )
        )
      ),
      route ? h(route, {dash, path: pathTail}) : null
    )
  }
}

widgetsControls.contextTypes = {
  send: React.PropTypes.func,
  open: React.PropTypes.func
}
