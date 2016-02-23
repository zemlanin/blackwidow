import { h, Component } from 'preact'
import _ from 'lodash'

import Text from './widgets/text'
import wImage from './widgets/image'
import wTable from './widgets/table'
import wGraph from './widgets/graph'

import style from 'css/base.css'

export default class Dash extends Component {
  render ({ container = {}, widgets = [] }) {
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
          class: style.widget,
          style: {
            left: (100 * container.position[0] / viewportX) + '%',
            top: (100 * container.position[1] / viewportY) + '%',
            width: (100 * container.size[0] / viewportX) + '%',
            height: (100 * container.size[1] / viewportY) + '%',
            outline: process.env.NODE_ENV !== 'production' && container.debug ? '1px solid ' + container.debug : '',
          },
        },
          h(component, {data: widget.data, container, widgetId})
        )
      })
    )
  }
}
