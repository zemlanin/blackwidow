import fs from 'fs'
import path from 'path'
import React from 'react'
import jsdom from 'mocha-jsdom'
import { mount } from 'enzyme'
import Dash from 'js/components/dash'

const h = React.createElement

const cases = (
  fs.readdirSync(path.join(__dirname, 'cases'))
  .filter(name => name.match(/\.json$/))
)

describe('./main', function () {
  jsdom()

  describe('render', function () {
    for (const c of cases) {
      // WIP: widget.endpoint => dataSources
      (c === 'zen_v2.json' ? it.skip : it)(c, function () {
        mount(h(Dash, require(`./cases/${c}`)))
      })
    }
  })
})
