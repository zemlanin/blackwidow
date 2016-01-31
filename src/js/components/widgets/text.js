'use strict'

import _ from 'lodash'

import {h, Component} from 'preact'

export default class Text extends Component {
  shouldComponentUpdate(nextProps) {
    return _.isEqual(nextProps, this.props)
  }

  render() {
    var {data, container} = this.props
    data = data || {}

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

    return h("div", {
        id: data.id,
        style: {
          padding: '0.1em',
          fontSize: fontSize,
          whiteSpace: 'normal',
        }
      },
      h("span", null, data.text),
      data.note ? h("span", {
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
}
