import Rx from 'rx'
import _ from 'lodash'

export function getAjaxStream (url) {
  return Rx.Observable.fromPromise(fetch(url).then(_.method('json')))
}

const findJSONFile = (files) => _.find(files, (file) => file.language === 'JSON')
const findNamedFile = (fileName) => (files) => _.find(files, (file) => file.filename === fileName)

export function getGistStream (gistIdWithName) {
  const [gistId, fileName] = gistIdWithName.split('/')

  return getAjaxStream(`https://api.github.com/gists/${gistId}`)
    .pluck('files')
    .map(fileName ? findNamedFile(fileName) : findJSONFile)
    .map((file) => JSON.parse(file.content))
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

export function getDash () {
  if (location.hash && location.hash.match(/^#(https?|file):/)) {
    if (location.hash.match(/^#(https?|file):/)) {
      const url = location.hash.replace(/^#/, '')
      return getAjaxStream(url)
        .map((dash) => ({dash}))
        .catch(dashErrorCallback)
    }
  }

  if (location.search.match(GIST_PARAM_REGEX)) {
    const gistIdWithName = location.search.match(GIST_PARAM_REGEX)[1]
    return getGistStream(gistIdWithName)
      .map((dash) => ({dash}))
      .catch(dashErrorCallback)
  }

  return getAjaxStream('./examples/mockDashes.json')
    .map((dash) => ({dash}))
    .catch(dashErrorCallback)
}
