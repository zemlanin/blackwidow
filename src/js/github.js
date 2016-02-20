import _ from 'lodash'
import Rx from 'rx'
import parse from 'url-parse'

const BASE_API_URL = 'https://api.github.com'
export const api = (path) => {
  const token = localStorage.getItem('github:token')
  let headers = new Headers()

  if (token) {
    headers.set('Authorization', `token ${token}`)
  }

  return Rx.Observable.fromPromise(
    fetch(BASE_API_URL + path, {
      headers,
    }).then(_.method('json'))
  )
}

export function init (freezer) {
  const parsedLocation = parse(location.href, true)
  const justAuthed = !!parsedLocation.query.access_token
  let accessToken = localStorage.getItem('github:token')

  if (justAuthed) {
    accessToken = parsedLocation.query.access_token
    localStorage.setItem('github:token', accessToken)

    parsedLocation.set('query', _.omit(parsedLocation.query, ['access_token', 'scope', 'token_type']))
    history.replaceState(history.state, '', parsedLocation.href)
  }

  if (accessToken) {
    freezer.get().auth.set('github', {accessToken})

    api('/user')
      .subscribe((user) => {
        freezer.get().auth.github.set('user', user)
        if (justAuthed) { window.event$.onNext({action: 'controlsToggle'}) }
      })
  }
}
