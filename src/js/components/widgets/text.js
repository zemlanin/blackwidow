'use strict'

import React, {DOM} from 'react'

export default React.createClass({
  displayName: 'widgets/Text',

  render: function() {
    var {data} = this.props
    data = data || {}

    var fontSize = '5vmin'
    if (data.text) {
      if (data.text.length > 40) {
        fontSize = '5vh'
      } else if (data.text.length > 20) {
        fontSize = '6vh'
      } else if (data.text.length > 15) {
        fontSize = '8vh'
      } else {
        fontSize = '10vh'
      }
    }

    return DOM.div({
        id: data.id,
        style: {
          padding: '0.5em',
          fontSize: fontSize,
        }
      },
      DOM.span(null, data.text),
      data.note ? DOM.span({
          style: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            color: 'gray',
            fontSize: '2vh',
            backgroundColor: 'black',
            padding: '5px',
          }
        },
        data.note
      ) : ''
    )
  }
})
