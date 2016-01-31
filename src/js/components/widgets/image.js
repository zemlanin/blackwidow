'use strict'

import _ from 'lodash'
import {h, Component} from 'preact'

// const noImage = 'linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent)'

export default class Image extends Component {
  shouldComponentUpdate(nextProps) {
    return _.isEqual(nextProps, this.props)
  }

  render() {
    var {data={}, container={}} = this.props

    return h("div", {
        style: {
          width: '100%',
          height: '100%',
          backgroundPosition: '50%',
          backgroundSize: data.src ? 'cover' : '10%',
          backgroundImage: data.src ? `url(${data.src})` : '',
        }
      },
      data.note ? h("span", {
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
}
