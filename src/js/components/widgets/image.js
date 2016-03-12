import _ from 'lodash'
import React from 'react'
const h = React.createElement

import { imageHolder, note } from 'css/widgets/image'

export default class Image extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const { data = {}, container = {} } = this.props

    return h('div', {
      className: imageHolder,
      style: {
        backgroundImage: data.src ? `url(${data.src})` : null,
      },
    },
      data.note ? h('span', {
        className: note,
        style: {fontSize: container.fontSize},
      },
        data.note
      ) : ''
    )
  }
}
