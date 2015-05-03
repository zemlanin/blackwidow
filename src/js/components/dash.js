'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

import Text from './widgets/text'

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
      _.map(this.props.widgets, (widget, index) => {
        var component

        switch (widget.type) {
          case 'text':
            component = Text
            break
        }

        return DOM.div({
            key: index,
            style: {
              position: 'absolute',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'table-cell',
              verticalAlign: 'middle',

              left: cellSizeX * widget.container.position[0] + '%',
              top: cellSizeY * widget.container.position[1] + '%',
              width: cellSizeX * widget.container.size[0] + '%',
              height: cellSizeY * widget.container.size[1] + '%',
              backgroundColor: widget.container.background,
            }
          }, React.createElement(component, {data: widget.data}))
      })
    )
  }
})
