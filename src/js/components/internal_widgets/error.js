import _ from 'lodash'
import React from 'react'
const h = React.createElement

export default class Error extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const { error = {}, data = {}, container = {} } = this.props

    let message

    if (_.isString(error)) {
      message = error
    } else if (error.basicAuthFailed) {
      message = 'Authorization required'
      // controlsPath = ['auth', error.service]
    } else {
      message = JSON.stringify(error)
    }

    var fontSize = container.fontSize || '3em'
    if (!container.fontSize) {
      if (message.length > 100) {
        fontSize = '4.5em'
      } else if (message.length > 50) {
        fontSize = '5.5em'
      } else if (message.length > 20) {
        fontSize = '6em'
      } else if (message.length > 15) {
        fontSize = '8em'
      } else {
        fontSize = '10em'
      }
    }

    return h('div', {
      id: data.id,
      style: {fontSize: fontSize}
    },
      h('span', null, message)
    )
  }
}
