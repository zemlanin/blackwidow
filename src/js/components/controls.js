import _ from 'lodash'
import c from 'classnames'
import { h, Component } from 'preact'

import * as css from 'css/controls'

const GITHUB_CLIENT_ID = process.env.NODE_ENV !== 'production' ? '781e22f823bc0ed6e42e' : '3ef5d8670134133c9544'

class githubUser extends Component {
  render ({auth: {github}, controls: {send}}) {
    if (!github.user) { return h('div') }

    return h('div', {},
      h('img', {src: github.user.avatar_url, style: {width: 64}}),
      h('div', {}, github.user.login),
      h('a', {onClick: send.bind(null, {action: 'githubLogout'})}, 'logout')
    )
  }
}

export default class Controls extends Component {
  render ({controls: {opened, send}, endpoints, auth}) {
    return h(
      'div',
      {class: c(css.wrapper, {[css.opened]: opened})},
      h('a', {onClick: send.bind(null, {action: 'controlsToggle'})}, 'close'),
      _(endpoints)
        .pickBy('error')
        .map(({url, error}) => `${url}: ${error}`)
        .value(),
      _(endpoints)
        .pickBy('ws')
        .map('ws')
        .uniqBy('url')
        .map((ws) => {
          return h('div', {class: c(css.ws, {[css.connected]: ws.connected})}, ws.url)
        })
        .value(),
      h('div', {class: css.content},
        auth.github
          ? h(githubUser, this.props)
          : h('a', {href: `https://github.com/login/oauth/authorize?scope=gist&client_id=${GITHUB_CLIENT_ID}`}, 'github auth')
      )
    )
  }
}
