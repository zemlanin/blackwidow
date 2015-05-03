'use strict'

import React, {DOM} from 'react'

const noImage = 'linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent)'

export default React.createClass({
  displayName: 'widgets/Image',

  render: function() {
    var {data} = this.props
    data = data || {}

    return DOM.div({
      style: {
        width: '100%',
        height: '100%',
        backgroundSize: data.src ? 'cover' : '10%',
        backgroundImage: data.src ? `url(${data.src})` : noImage,
        backgroundPosition: '50%',
      }
    })
  }
})
