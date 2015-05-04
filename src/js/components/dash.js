'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

import {debug} from 'config'
import Text from './widgets/text'
import wImage from './widgets/image'

export default React.createClass({
  displayName: 'Dash',

  render: function() {
    var cellSizeX, cellSizeY

    switch (this.props.sizeX) {
      case 5:
        cellSizeX = 20
        break
      case 4:
        cellSizeX = 25
        break
      case 3:
      default:
        cellSizeX = 33
        break
    }

    switch (this.props.sizeY) {
      case 5:
        cellSizeY = 20
        break
      case 4:
        cellSizeY = 25
        break
      case 3:
      default:
        cellSizeY = 33
        break
    }

    return DOM.div(
      null,
      _.map(this.props.widgets, (widget, widgetId) => {
        var component

        if (widget.container === void 0) {
          return ''
        }

        switch (widget.type) {
          case 'text':
            component = Text
            break
          case 'image':
            component = wImage
            break
        }

        return DOM.div({
            key: widgetId,
            style: {
              position: 'absolute',
              overflow: 'hidden',
              whiteSpace: 'nowrap',

              left: cellSizeX * widget.container.position[0] + '%',
              top: cellSizeY * widget.container.position[1] + '%',
              width: cellSizeX * widget.container.size[0] + '%',
              height: cellSizeY * widget.container.size[1] + '%',
              outline: debug ? '1px solid ' + widget.container.background : '',
            }
          },
          React.createElement(component, {data: widget.data})
        )
      })
    )
  }
})
