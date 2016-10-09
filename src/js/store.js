/* @flow */
import _ from 'lodash'
import Rx from 'rx'
import Freezer from 'freezer-js'
import queryString from 'query-string'

import { api } from './github'
import { extractEndpoints, loadExternalWidgets, copyLocalWidgets } from './endpoints'

const BWD_EXAMPLES = process.env.BWD_EXAMPLES

export function createFreezer () {
  return new Freezer({
    endpoints: {},
    dash: {},
    controls: {
      opened: false,
      path: decodeURIComponent(queryString.parse(location.search).controls || 'widgets').split('/')
    },
    auth: {}
  })
}

export function getAjaxStream (url: string, options: fetch.RequestOptions) {
  return Rx.Observable.fromPromise(fetch(url, options).then(r => r.json()))
}

type GistFile = {
  language: string,
  filename: string
}

export const findJSONFile = (files: GistFile[]) => _.find(files, (file: GistFile) => file.language === 'JSON')
export const findNamedFile = (fileName: string) => (files: GistFile[]) => _.find(files, (file: GistFile) => file.filename === fileName)

export function getGistStream (gistId: string) {
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

const isLoadable = (url: string) => url && url.match(/^(https?:|file:|\/)/)

function loadDashboardFromUrl (url: string) {
  return getAjaxStream(url).map((dash) => ({dash})).catch(dashErrorCallback)
}

function loadDashboardFromGist (gist: string) {
  const [gistId, fileName] = gist.split('/')
  return getGistStream(gistId)
    .map(fileName ? findNamedFile(fileName) : findJSONFile)
    .map((file) => JSON.parse(file.content))
    .map((dash) => ({dash}))
    .catch(dashErrorCallback)
}

function waitForDashUrl () {
  const parsedSearch = queryString.parse(location.search)
  const example = _.find(BWD_EXAMPLES, ['name', parsedSearch.dash])

  const dashUrl = (
    example && isLoadable(example.url) && example.url ||
    isLoadable(location.hash.replace(/^#/, '')) && location.hash.replace(/^#/, '')
  )

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
    .flatMap(waitForDashUrl)
}

export function getDash (dashSource?: () => Rx.Observable) {
  if (dashSource === undefined) { dashSource = waitForDashUrl }

  return dashSource()
    .flatMap(loadExternalWidgets)
    .map(copyLocalWidgets)
    .map(extractEndpoints)
}
