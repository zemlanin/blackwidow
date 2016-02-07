import Rx from 'rx'
import _ from 'lodash'

function getAjaxStream (url) {
  return Rx.Observable.fromPromise(fetch(url).then(_.method('json')))
}

export function getDash () {
  var dashStream

  if (location.hash && location.hash.match(/^#(https?|file):/)) {
    if (location.hash.match(/^#(https?|file):/)) {
      const url = location.hash.replace(/^#/, '')
      dashStream = getAjaxStream(url)
    }
  }

  if (location.search.match(/[?&]gist=([0-9a-f]+)/i)) {
    const gistId = location.search.match(/[?&]gist=([0-9a-f]+)/i)[1]
    dashStream = getAjaxStream(`https://api.github.com/gists/${gistId}`)
      .pluck('files')
      .map((files) => _.find(files, (file) => file.language === 'JSON'))
      .map((file) => JSON.parse(file.content))
  }

  if (!dashStream) {
    dashStream = getAjaxStream('./examples/mockDashes.json')
  }

  return dashStream
    .catch((err) => Rx.Observable.return({
      'widgets': {
        'error': {
          'type': 'text',
          'container': {
            'position': [0, 0],
            'size': [10, 10],
            'background': 'red',
          },
          'data': {'text': err.message},
        },
      },
    }))
}
