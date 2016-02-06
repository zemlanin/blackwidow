import _ from 'lodash'
import { h, Component } from 'preact'

import { imageHolder, note } from 'css/widgets/image'

export default class Image extends Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    var { data = {}, container = {} } = this.props

    return h('div', {
      class: imageHolder,
      style: {
        backgroundImage: data.src ? `url(${data.src})` : '',
      },
    },
      data.note ? h('span', {
        class: note,
        style: {fontSize: container.fontSize},
      },
        data.note
      ) : ''
    )
  }
}
