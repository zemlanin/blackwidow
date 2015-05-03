'use strict'

import React, {DOM} from 'react'

export default React.createClass({
  displayName: 'Dash',

  render: function() {
    var {data} = this.props
    data = data || {}

    return DOM.div({
        id: data.id,
        style: {
          padding: '0.5em',
        }
      },
      data.text || 'hello'
    )
  }
})
