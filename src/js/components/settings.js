'use strict'

import React, {DOM} from 'react'

export default class Settings extends React.Component {
  render() {
    return DOM.span({
      key: 's',
      style: {
        backgroundColor: 'gray',
      }
    }, this.props.text)
  }
}
