import _ from 'lodash'
import c from 'classnames'
import React from 'react'
const h = React.createElement
const GITHUB_API_KEY = process.env.GITHUB_API_KEY

import widgetsControls from './widgets_controls'
import dashboardsControls from './dashboards_controls'

import * as css from 'css/controls'

class githubUser extends React.Component {
  render () {
    const {github, send} = this.props

    if (!github.user) { return h('div') }

    return h('div', {},
      h('div', {}, h('img', {src: github.user.avatar_url, style: {width: 16}}), github.user.login),
      h('a', {onClick: send.bind(null, {action: 'githubLogout'})}, 'logout')
    )
  }
}

export default class Controls extends React.Component {
  render () {
    const {controls: {opened, path: [pathHead, ...pathTail], send}, endpoints, auth, dash} = this.props

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
      GITHUB_API_KEY ? h('div', {className: css.content},
        auth.github
          ? h(githubUser, {send, github: auth.github})
          : h('a', {href: `https://github.com/login/oauth/authorize?scope=gist&client_id=${GITHUB_API_KEY}`}, 'github auth')
      ) : '',
      h('hr'),
      route ? h(route, {path: pathTail, send, dash}) : null
    )
  }
}
