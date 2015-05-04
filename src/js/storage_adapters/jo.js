// https://github.com/zemlanin/jo
"use strict"

import {Observable} from 'rx'
import {mockDashes} from './mockDashes'

export function getDash(id) {
  return Observable.return(mockDashes[id] || mockDashes[0])
}

export function getDashUpdates() {
  var {messageBusStream} = window

  return messageBusStream
    .map(({data}) => data)
    .filter(({type}) => type === 'update')
    .map(({id}) => id)
    .flatMap(getDash)
}
