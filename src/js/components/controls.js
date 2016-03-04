import _ from 'lodash'
import c from 'classnames'
import React from 'react'
const h = React.createElement
import * as config from 'config'

import * as css from 'css/controls'

class githubUser extends React.Component {
  render ({auth: {github}, controls: {send}}) {
    if (!github.user) { return h('div') }

    return h('div', {},
      h('img', {src: github.user.avatar_url, style: {width: 64}}),
      h('div', {}, github.user.login),
      h('a', {onClick: send.bind(null, {action: 'githubLogout'})}, 'logout')
    )
  }
}

export default class Controls extends React.Component {
  render () {
    const {controls: {opened, send}, endpoints, auth, dash} = this.props
    return h(
      'div',
      {className: c(css.wrapper, {[css.opened]: opened})},
      h('a', {onClick: send.bind(null, {action: 'controlsToggle'})}, 'close'),
      h('br'),
      _(endpoints)
        .pickBy('error')
        .map(({url, error}) => `${url}: ${error}`)
        .value(),
      _(dash.widgets)
        .pickBy('error')
        .map('error')
        .value(),
      _(endpoints)
        .pickBy('ws')
        .map('ws')
        .uniqBy('url')
        .map((ws) => {
          return h('div', {className: c(css.ws, {[css.connected]: ws.connected})}, ws.url)
        })
        .value(),
      config.github ? h('div', {className: css.content},
        auth.github
          ? h(githubUser, this.props)
          : h('a', {href: `https://github.com/login/oauth/authorize?scope=gist&client_id=${config.github}`}, 'github auth')
      ) : ''
    )
  }
}
