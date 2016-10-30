import { flow, pick, mapValues } from 'lodash'
import hash from 'object-hash'

function addSourceRef (dataMapping, sourceRef) {
  return Object.entries(dataMapping).reduce((acc, [k, v]) => {
    if (v && v._expr) {
      if (v._source) { throw new Error('can\'t convert old dashboard format. rename or remove `_source` in mappings') }

      return {...acc, [k]: {...v, _source: sourceRef}}
    } else {
      return {...acc, [k]: {_expr: v, _source: sourceRef}}
    }
  }, {})
}

function extractSharedEndpoint (dataSources, widget) {
  let {endpoint, ...newWidget} = widget
  if (endpoint && endpoint.url && endpoint.map) {
    // TODO
    // if (isObject(endpoint.body)) {
    //   endpoint.body = JSON.stringify(endpoint.body)
    // }

    const extractedEndpoint = pick(endpoint, ['url', 'method', 'body', 'plain', 'headers', 'auth', 'schedule'])
    const endpointHash = hash.MD5(pick(endpoint, ['url', 'method', 'body', 'plain', 'headers', 'auth']))

    dataSources[endpointHash] = extractedEndpoint

    return {
      ...newWidget,
      data: {
        ...newWidget.data,
        ...addSourceRef(endpoint.map, endpointHash)
      }
    }
  }

  return newWidget
}

function moveEndpointsToDataSources (dash) {
  if (!Object.values(dash.widgets).some(v => v && v.endpoint)) { return dash }

  const dataSources = dash.dataSources || {}
  const newWidgets = mapValues(dash.widgets, (w) => extractSharedEndpoint(dataSources, w))

  return {
    widgets: newWidgets,
    dataSources
  }
}

function extractLocal (dataSources, widget) {
  let {local, ...newWidget} = widget
  if (local && local.schedule && local.schedule.timeInterval && local.map) {
    const localHash = hash.MD5(local)

    dataSources[localHash] = {
      local: true,
      schedule: {
        timeInterval: local.schedule.timeInterval
      }
    }

    return {
      ...newWidget,
      data: {
        ...newWidget.data,
        ...addSourceRef(local.map, localHash)
      }
    }
  }

  return newWidget
}

function moveLocalsToDataSources (dash) {
  if (!Object.values(dash.widgets).some(v => v && v.local)) { return dash }

  const dataSources = dash.dataSources || {}
  const newWidgets = mapValues(dash.widgets, (w) => extractLocal(dataSources, w))

  return {
    widgets: newWidgets,
    dataSources
  }
}

export function preDataSourcesCompatability (state) {
  const { dash } = state
  if (!dash || !dash.widgets || dash.dataSources) { return state }

  return {
    ...state,
    dash: flow(
      moveEndpointsToDataSources,
      moveLocalsToDataSources
    )(dash)
  }
}
