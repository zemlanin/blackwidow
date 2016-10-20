import fs from 'fs'
import path from 'path'
import Rx from 'rx'
import React from 'react'
import jsdom from 'mocha-jsdom'
import { mount } from 'enzyme'
import Dash from 'js/components/dash'
import { getDash } from 'js/store'

const h = React.createElement

const cases = (
  fs.readdirSync(path.join(__dirname, 'cases'))
  .filter(name => name.match(/\.json$/))
)

describe('./main', function () {
  jsdom()

  describe('render', function () {
    for (const c of cases) {
      it(c, function () {
        const case$ = () => Rx.Observable.of(require(`./cases/${c}`))

        mount(h(Dash, getDash(case$)))
      })
    }
  })
})
