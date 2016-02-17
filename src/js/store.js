import Rx from 'rx'
import _ from 'lodash'

export function getAjaxStream (url) {
  return Rx.Observable.fromPromise(fetch(url).then(_.method('json')))
}

export function getGistStream (gistId) {
  return getAjaxStream(`https://api.github.com/gists/${gistId}`)
    .pluck('files')
    .map((files) => _.find(files, (file) => file.language === 'JSON'))
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

export function getDash () {
  if (location.hash && location.hash.match(/^#(https?|file):/)) {
    if (location.hash.match(/^#(https?|file):/)) {
      const url = location.hash.replace(/^#/, '')
      return getAjaxStream(url)
        .map((dash) => ({dash}))
        .catch(dashErrorCallback)
    }
  }

  if (location.search.match(/[?&]gist=([0-9a-f]+)/i)) {
    const gistId = location.search.match(/[?&]gist=([0-9a-f]+)/i)[1]
    return getGistStream(gistId)
      .map((dash) => ({dash}))
      .catch(dashErrorCallback)
  }

  return getAjaxStream('./examples/mockDashes.json')
    .map((dash) => ({dash}))
    .catch(dashErrorCallback)
}
