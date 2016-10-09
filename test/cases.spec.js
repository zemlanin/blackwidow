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

describe('Dash render', function () {
  jsdom()

  for (const c of cases) {
    it(c, function () {
      mount(h(Dash, require('./cases/' + c)))
    })
  }
})
