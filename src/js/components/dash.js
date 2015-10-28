'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

import {debug} from 'config'
import Text from './widgets/text'
import wImage from './widgets/image'
import wTable from './widgets/table'
import wGraph from './widgets/graph'

export default React.createClass({
  displayName: 'Dash',

  render: function() {
    return DOM.div(
      null,
      _.map(this.props.widgets, (widget, widgetId) => {
        var component
        var {container} = widget

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

        return DOM.div({
            key: widgetId,
            style: {
              position: 'absolute',
              overflow: 'hidden',
              whiteSpace: 'nowrap',

              left: 10 * container.position[0] + '%',
              top: 10 * container.position[1] + '%',
              width: 10 * container.size[0] + '%',
              height: 10 * container.size[1] + '%',
              outline: debug && container.debug ? '1px solid ' + container.debug : '',
            }
          },
          React.createElement(
            component,
            {data: widget.data, container}
          )
        )
      })
    )
  }
})
