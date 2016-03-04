import _ from 'lodash'
import React from 'react'
const Component = React.Component
const h = React.createElement

import Text from './widgets/text'
import wImage from './widgets/image'
import wTable from './widgets/table'
import wGraph from './widgets/graph'

import style from 'css/base.css'

export default class Dash extends Component {
  render () {
    const { container = {}, widgets = [] } = this.props
    const [viewportX, viewportY] = (container || {}).size || [10, 10]

    return h('div',
      {
        style: container.style || null,
      },
      _.map(widgets, (widget, widgetId) => {
        const {container} = widget
        var component

        if (container === void 0) {
          return ''
        }

        switch (widget.type) {
          case 'text':
            component = Text
            break
          case 'image':
            component = wImage
            break
          case 'table':
            component = wTable
            break
          case 'graph':
            component = wGraph
            break
        }

        return h('div', {
          key: widgetId,
          'data-widget-data': process.env.NODE_ENV !== 'production' ? JSON.stringify(widget.data) : null,
          className: style.widget,
          style: {
            left: (100 * container.position[0] / viewportX) + '%',
            top: (100 * container.position[1] / viewportY) + '%',
            width: (100 * container.size[0] / viewportX) + '%',
            height: (100 * container.size[1] / viewportY) + '%',
            outline: process.env.NODE_ENV !== 'production' ? `1px solid ${container.debug || 'white'}` : '',
          },
        },
          h(component, {data: widget.data, container, widgetId})
        )
      })
    )
  }
}
