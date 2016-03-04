import _ from 'lodash'
import React from 'react'
const Component = React.Component
const h = React.createElement

import { imageHolder, note } from 'css/widgets/image'

export default class Image extends Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render ({ data = {}, container = {} }) {
    return h('div', {
      className: imageHolder,
      style: {
        backgroundImage: data.src ? `url(${data.src})` : '',
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
