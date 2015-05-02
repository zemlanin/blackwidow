'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

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
      _.map(this.props.widgets, (widget, index) => DOM.div({
          key: index,
          id: widget.data.id,
          style: {
            position: 'absolute',
            overflow: 'hidden',
            whiteSpace: 'nowrap',

            left: cellSizeX * widget.position[0] + '%',
            top: cellSizeY * widget.position[1] + '%',
            width: cellSizeX * widget.size[0] + '%',
            height: cellSizeY * widget.size[1] + '%',
            backgroundColor: widget.data.background,
          }
        },
        DOM.div(
          {style: {padding: '0.5em'}}, widget.data.text || 'hello'
        )
      ))
    )
  }
})
