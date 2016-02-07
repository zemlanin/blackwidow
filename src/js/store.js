import Rx from 'rx'
import _ from 'lodash'

function getAjaxStream (url) {
  return Rx.Observable.fromPromise(fetch(url).then(_.method('json')))
}

function dashErrorCallback (err) {
  return Rx.Observable.of({
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
  })
}

export function getDash () {
  if (location.hash && location.hash.match(/^#(https?|file):/)) {
    if (location.hash.match(/^#(https?|file):/)) {
      const url = location.hash.replace(/^#/, '')
      return getAjaxStream(url)
        .catch(dashErrorCallback)
    }
  }

  if (location.search.match(/[?&]gist=([0-9a-f]+)/i)) {
    const gistId = location.search.match(/[?&]gist=([0-9a-f]+)/i)[1]
    return getAjaxStream(`https://api.github.com/gists/${gistId}`)
      .pluck('files')
      .map((files) => _.find(files, (file) => file.language === 'JSON'))
      .map((file) => JSON.parse(file.content))
      .catch(dashErrorCallback)
  }

  return getAjaxStream('./examples/mockDashes.json')
    .catch(dashErrorCallback)
}
