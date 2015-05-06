'use strict'

import Rx from 'rx'

export function getGoogleApiStream() {
  var googleApiReady = new Rx.Subject()
  var googleApiReadyName = `_rxPush_${Date.now()}_${parseInt(Math.random() * 1000, 10)}`
  window[googleApiReadyName] = () => {
    googleApiReady.onNext(window.gapi)
    window[googleApiReadyName] = null
  }

  console.log(googleApiReadyName)

  var googleApiScript = document.createElement('script')
  googleApiScript.type = "text/javascript"
  googleApiScript.src = `https://apis.google.com/js/client.js?onload=${googleApiReadyName}`
  document.body.appendChild(googleApiScript)

  return googleApiReady
}
