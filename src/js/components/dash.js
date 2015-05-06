'use strict'

import React, {DOM} from 'react'
import _ from 'lodash'

import {debug} from 'config'
import Text from './widgets/text'
import wImage from './widgets/image'

export default React.createClass({
  displayName: 'Dash',

  render: function() {
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

              left: 10 * widget.container.position[0] + '%',
              top: 10 * widget.container.position[1] + '%',
              width: 10 * widget.container.size[0] + '%',
              height: 10 * widget.container.size[1] + '%',
              outline: debug ? '1px solid ' + widget.container.background : '',
            }
          },
          React.createElement(component, {data: widget.data})
        )
      })
    )
  }
})
