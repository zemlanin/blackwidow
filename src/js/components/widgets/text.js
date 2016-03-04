import _ from 'lodash'
import React from 'react'
const h = React.createElement

import { border, note } from 'css/widgets/text'

export default class Text extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render ({ data = {}, container = {} }) {
    var fontSize = container.fontSize || '3em'
    if (data.text && !container.fontSize) {
      if (data.text.length > 100) {
        fontSize = '4.5em'
      } else if (data.text.length > 50) {
        fontSize = '5.5em'
      } else if (data.text.length > 20) {
        fontSize = '6em'
      } else if (data.text.length > 15) {
        fontSize = '8em'
      } else {
        fontSize = '10em'
      }
    }

    return h('div', {
      id: data.id,
      className: border,
      style: {fontSize: fontSize},
    },
      h('span', null, data.text),
      data.note ? h('span', {className: note}, data.note) : ''
    )
  }
}
