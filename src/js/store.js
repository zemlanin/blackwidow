import _ from 'lodash'
import Rx from 'rx'
import queryString from 'query-string'

import { api } from './github'

const BWD_EXAMPLES = process.env.BWD_EXAMPLES

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
            size: [10, 10]
          },
          data: {text: err.message}
        }
      }
    }
  })
}

const GIST_PARAM_REGEX = /([0-9a-f]{20}\/?[a-z0-9\.\-_]*)/i

const isLoadable = (url) => url && url.match(/^(https?:|file:|\/)/)

function loadDashboardFromUrl (url) {
  return getAjaxStream(url).map((dash) => ({dash})).catch(dashErrorCallback)
}

function loadDashboardFromGist (gist) {
  const [gistId, fileName] = gist.split('/')
  return getGistStream(gistId)
    .map(fileName ? findNamedFile(fileName) : findJSONFile)
    .map((file) => JSON.parse(file.content))
    .map((dash) => ({dash}))
    .catch(dashErrorCallback)
}

export function getDash () {
  const parsedSearch = queryString.parse(location.search)
  const example = _.find(BWD_EXAMPLES, ['name', parsedSearch.dash])

  const dashUrl = (
    example && isLoadable(example.url) && example.url ||
    isLoadable(location.hash.replace(/^#/, '')) && location.hash.replace(/^#/, '')
  )

  console.log(parsedSearch)
  if (dashUrl) { return loadDashboardFromUrl(dashUrl) }

  const dashGist = (
    example && (example.gist || '').match(GIST_PARAM_REGEX) && example.gist ||
    (parsedSearch.gist || '').match(GIST_PARAM_REGEX) && parsedSearch.gist
  )

  if (dashGist) { return loadDashboardFromGist(dashGist) }

  window.event$.onNext({action: 'showDashboards'})

  return Rx.Observable.merge(
    Rx.Observable.fromEvent(window, 'popstate'),
    window.event$.filter(_.matchesProperty('action', 'open'))
  )
    .map(() => queryString.parse(location.search).dash)
    .filter((name) => _.find(BWD_EXAMPLES, ['name', name]))
    .distinctUntilChanged()
    .take(1)
    .flatMap(getDash)
}
