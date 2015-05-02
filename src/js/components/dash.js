'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

export default React.createClass({
  displayName: 'Dash',
  render: function() {
    return DOM.div(
      null,
      _.map(this.props.widgets, (widget, index) => DOM.div({
          key: index,
          id: widget.data.id,
          style: {
            position: 'absolute',
            overflow: 'hidden',
            whiteSpace: 'nowrap',

            left: 33 * widget.position[0] + '%',
            top: 33 * widget.position[1] + '%',
            width: 33 * widget.size[0] + '%',
            height: 33 * widget.size[1] + '%',
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
