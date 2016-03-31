import Rx from 'rx'
import _ from 'lodash'

import { api } from './github'

export function getAjaxStream (url) {
  return Rx.Observable.fromPromise(fetch(url).then(_.method('json')))
}

export const findJSONFile = (files) => _.find(files, (file) => file.language === 'JSON')
export const findNamedFile = (fileName) => (files) => _.find(files, (file) => file.filename === fileName)

export function getGistStream (gistId) {
  return api(`/gists/${gistId}`).pluck('files')
}

function dashErrorCallback (err) {
  return Rx.Observable.of({
    dash: {
      container: {size: [1, 1]},
      widgets: {
        error: {
          type: 'text',
          container: {
            position: [0, 0],
            size: [10, 10],
          },
          data: {text: err.message},
        },
      },
    },
  })
}

const GIST_PARAM_REGEX = /[?&]gist=([0-9a-f]{20}\/?[a-z0-9\.\-\_]*)/i

const isHashLoadable = () => location.hash && location.hash.match(/^#(https?:|file:|\/)/)

export function getDash () {
  if (isHashLoadable()) {
    const url = location.hash.replace(/^#/, '')
    return getAjaxStream(url)
      .map((dash) => ({dash}))
      .catch(dashErrorCallback)
  }

  if (location.search.match(GIST_PARAM_REGEX)) {
    const [gistId, fileName] = location.search.match(GIST_PARAM_REGEX)[1].split('/')
    return getGistStream(gistId)
      .map(fileName ? findNamedFile(fileName) : findJSONFile)
      .map((file) => JSON.parse(file.content))
      .map((dash) => ({dash}))
      .catch(dashErrorCallback)
  }

  window.event$.onNext({action: 'showDashboards'})

  return window.event$
    .filter((msg) => msg.action === 'selectDash')
    .do((msg) => window.history.replaceState({}, '', msg.data))
    .take(1)
    .flatMap(getDash)
    .take(1)
}
