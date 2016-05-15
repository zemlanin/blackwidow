import _ from 'lodash'
import c from 'classnames'
import React from 'react'
const h = React.createElement
import * as config from 'config'

import widgetsControls from './widgets_controls'
import dashboardsControls from './dashboards_controls'

import * as css from 'css/controls'

class githubUser extends React.Component {
  render () {
    const {auth: {github}, controls: {send}} = this.props

    if (!github.user) { return h('div') }

    return h('div', {},
      h('div', {}, h('img', {src: github.user.avatar_url, style: {width: 16}}), github.user.login),
      h('a', {onClick: send.bind(null, {action: 'githubLogout'})}, 'logout')
    )
  }
}

export default class Controls extends React.Component {
  render () {
    const {controls: {opened, path}, endpoints, auth, dash} = this.props

    let route

    if (path[0] === 'widgets') {
      route = widgetsControls
    } else if (path[0] === 'dashboards') {
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
      config.github ? h('div', {className: css.content},
        auth.github
          ? h(githubUser, this.props)
          : h('a', {href: `https://github.com/login/oauth/authorize?scope=gist&client_id=${config.github}`}, 'github auth')
      ) : '',
      h('hr'),
      route ? h(route, this.props) : null
    )
  }
}
