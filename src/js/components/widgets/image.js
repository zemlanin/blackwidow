'use strict'

import _ from 'lodash'
import React, {DOM} from 'react'

// const noImage = 'linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent)'

export default React.createClass({
  displayName: 'widgets/Image',

  shouldComponentUpdate: function (nextProps) {
    return _.isEqual(nextProps, this.props)
  },

  render: function() {
    var {data={}, container={}} = this.props

    return DOM.div({
        style: {
          width: '100%',
          height: '100%',
          backgroundPosition: '50%',
          backgroundSize: data.src ? 'cover' : '10%',
          backgroundImage: data.src ? `url(${data.src})` : '',
        }
      },
      data.note ? DOM.span({
          style: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            color: 'gray',
            fontSize: container.fontSize || '2em',
            backgroundColor: 'black',
            padding: '5px',
          }
        },
        data.note
      ) : ''
    )
  }
})
