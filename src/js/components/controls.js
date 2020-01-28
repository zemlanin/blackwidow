import _ from 'lodash'
import c from 'classnames'
import React from 'react'
const h = React.createElement

import widgetsControls from './widgets_controls'
import dashboardsControls from './dashboards_controls'

import * as css from 'css/controls'

class githubUser extends React.Component {
  render () {
    const {github} = this.props
    const {send} = this.context

    if (!github.user) { return h('div') }

    return h('div', {},
      h('div', {}, h('img', {src: github.user.avatar_url, style: {width: 16}}), github.user.login),
      h('a', {onClick: send.bind(null, {action: 'githubLogout'})}, 'logout')
    )
  }
}

githubUser.contextTypes = {
  send: React.PropTypes.function
}

export default class Controls extends React.Component {
  getChildContext () {
    return {
      send: this.props.controls.send
    }
  }

  render () {
    const {controls: {opened, path: [pathHead, ...pathTail]}, endpoints, dash} = this.props

    let route

    if (pathHead === 'widgets') {
      route = widgetsControls
    } else if (pathHead === 'dashboards') {
      route = dashboardsControls
    }

    return h(
      'div',
      {className: c(css.wrapper, {[css.opened]: opened})},
      _(endpoints)
        .pickBy('error')
        .map(({url, error}, i) => h('div', {key: i}, `${url}: ${error}`))
        .value(),
      _(dash.widgets)
        .pickBy('error')
        .map(({error}, i) => h('div', {key: i}, h('b', {style: {color: 'red'}}, `${i}: `), JSON.stringify(error)))
        .value(),
      _(endpoints)
        .pickBy('ws')
        .map('.ws')
        .uniqBy('url')
        .map((ws, i) => {
          return h('div', {key: i, className: c(css.ws, {[css.connected]: ws.connected})}, ws.url)
        })
        .value(),
      h('hr'),
      route ? h(route, {path: pathTail, dash}) : null
    )
  }
}

Controls.childContextTypes = {
  send: React.PropTypes.func
}
