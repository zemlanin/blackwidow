import _ from 'lodash'
import Rx from 'rx'
import parse from 'url-parse'

import { getTokenAuthHeader, setTokenAuthHeader } from './auth'

const BASE_API_URL = 'https://api.github.com'
const resourceETags = {}

export const api = (path) => {
  const token = getTokenAuthHeader('github')
  let headers = new Headers()

  if (token) {
    headers.set('Authorization', `token ${token}`)
  }

  if (resourceETags[path]) {
    headers.set('If-None-Match', resourceETags[path])
  }

  return Rx.Observable.fromPromise(
    fetch(BASE_API_URL + path, {headers})
    .then((resp) => {
      const ETag = resp.headers.get('ETag')
      if (ETag) {
        resourceETags[path] = ETag
      }

      return resp.json()
    })
  )
}

export function init (freezer) {
  const parsedLocation = parse(location.href, true)
  const justAuthed = !!parsedLocation.query.access_token
  let accessToken = getTokenAuthHeader('github')

  if (justAuthed) {
    accessToken = parsedLocation.query.access_token
    setTokenAuthHeader('github', accessToken)

    parsedLocation.set('query', _.omit(parsedLocation.query, ['access_token', 'scope', 'token_type']))
    history.replaceState(history.state, '', parsedLocation.href)
  }

  if (accessToken) {
    freezer.get().auth.set('github', {})

    api('/user')
      .subscribe((user) => {
        freezer.get().auth.github.set('user', user)
        if (justAuthed) { window.event$.onNext({action: 'controlsToggle'}) }
      })
  }
}
