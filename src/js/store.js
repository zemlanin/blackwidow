/* @flow */
import _ from 'lodash'
import Rx from 'rx'
import Freezer from 'freezer-js'
import queryString from 'query-string'

import { api } from './github'
import { loadExternalWidgets, copyLocalWidgets, addRefsToDataSources } from './endpoints'
import type { State, DataMapping } from './store'
import { preDataSourcesCompatability } from './compatability/pre_dataSources'

const BWD_EXAMPLES = process.env.BWD_EXAMPLES

export function createFreezer () {
  return new Freezer({
    endpoints: {},
    dash: {},
    controls: {
      opened: false,
      path: decodeURIComponent(queryString.parse(location.search).controls || 'widgets').split('/')
    },
    auth: {},
    dataSources: {}
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

export function keepComputableData (data: any): DataMapping | null {
  if (_.isArray(data)) {
    const result = data.map(keepComputableData).filter(Boolean)
    return result.length ? result : null
  }

  if (_.isObject(data)) {
    if (!Object.keys(data).length) { return null }

    if (data._source) {
      return {
        ...data,
        _expr: data._expr || '$',
        _source: data._source
      }
    }

    if (data._expr && !data._source) { return null }

    const result = Object.entries(data).reduce(
      (acc, [k, v]) => {
        if (k.startsWith('_')) { return acc }

        const cleanValue = keepComputableData(v)

        if (cleanValue) { return { ...acc, [k]: cleanValue } }

        return acc
      },
      {}
    )

    return Object.keys(result).length ? result : null
  }

  return null
}

export function removeComputableData (data: any) {
  if (_.isArray(data)) {
    return data.map(removeComputableData)
  }

  if (!_.isObject(data)) {
    return data
  }

  if (Object.keys(data || {}).some(v => v === '_expr' || v === '_source')) {
    return null
  }

  return Object.entries(data).reduce(
    (acc, [k, v]) => {
      if (k.startsWith('_')) { return acc }

      if (_.isObject(v)) {
        const cleanValue = removeComputableData(v) || {}

        if (Object.keys(cleanValue).length) {
          return { ...acc, [k]: cleanValue }
        }

        return acc
      }

      if (_.isArray(v)) {
        return { ...acc, [k]: (v: any).map(removeComputableData) }
      }

      return { ...acc, [k]: v }
    },
    {}
  )
}

export function extractDataMapping (state: State): State {
  if (!state || !state.dash) { return state }

  const { dash } = state

  const newWidgets = {}

  for (const [id, widget] of Object.entries(dash.widgets)) {
    newWidgets[id] = {
      ...widget,
      data: removeComputableData(widget.data || {}),
      dataMapping: keepComputableData(widget.data || {}) || {}
    }
  }

  return {
    ...state,
    dash: {
      ...dash,
      widgets: newWidgets
    }
  }
}

export function getDash (dashSource?: () => Rx.Observable): {dash: any, dataSources: any} {
  if (dashSource === undefined) { dashSource = waitForDashUrl }

  return dashSource()
    .flatMap(loadExternalWidgets)
    .map(copyLocalWidgets)
    .map(preDataSourcesCompatability)
    .map(addRefsToDataSources)
    .map(extractDataMapping)
}
