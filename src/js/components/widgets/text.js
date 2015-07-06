'use strict'

import React, {DOM} from 'react'

export default React.createClass({
  displayName: 'widgets/Text',

  render: function() {
    var {data, container} = this.props
    data = data || {}

    var fontSize = container.fontSize || '3em'
    if (data.text && !container.fontSize) {
      if (data.text.length > 50) {
        fontSize = '4em'
      } else if (data.text.length > 40) {
        fontSize = '5em'
      } else if (data.text.length > 20) {
        fontSize = '6em'
      } else if (data.text.length > 15) {
        fontSize = '8em'
      } else {
        fontSize = '10em'
      }
    }

    return DOM.div({
        id: data.id,
        style: {
          padding: '0.1em',
          fontSize: fontSize,
          whiteSpace: 'normal',
        }
      },
      DOM.span(null, data.text),
      data.note ? DOM.span({
          style: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            color: 'gray',
            fontSize: '0.5em',
            backgroundColor: 'black',
            padding: '5px',
          }
        },
        data.note
      ) : ''
    )
  }
})
