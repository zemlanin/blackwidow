import Rx from 'rx'
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { getDash, extractSourceData } from 'js/store'

const cases = (
  fs.readdirSync(path.join(__dirname, 'cases'))
  .filter(name => name.match(/\.json$/))
)

describe('./store', function () {
  describe('smoke', function () {
    for (const c of cases) {
      it(c, function (done) {
        const dashSource = () => Rx.Observable.of({dash: require(`./cases/${c}`)})
        getDash(dashSource)
          .subscribe(
            () => done(),
            done
          )
      })
    }
  })

  describe('cases/zen.json', function () {
    const dashSource = () => Rx.Observable.of({dash: require('./cases/zen.json')})

    it('has endpoint ref', function (done) {
      getDash(dashSource)
        .subscribe(
          ({dash, endpoints}) => {
            assert.ok(endpoints[dash.widgets.zen.endpoint._ref].url)
            done()
          },
          done
        )
    })
  })

  describe('extractSourceData', function () {
    const expressionlessData = { text: 'lol' }
    const expressionData = { src: {_expr: '$', _source: 'ref'} }
    const mixedData = { text: 'lol', src: {_expr: '$', _source: 'ref'} }

    const dashWithData = (data) => ({dash: {widgets: {a: {data}}}})

    assert.deepEqual(
      extractSourceData(dashWithData(expressionlessData)).dash.widgets.a,
      {
        data: expressionlessData,
        sourceData: expressionlessData
      }
    )

    assert.deepEqual(
      extractSourceData(dashWithData(expressionData)).dash.widgets.a,
      {
        data: {},
        sourceData: expressionData
      }
    )

    assert.deepEqual(
      extractSourceData(dashWithData(mixedData)).dash.widgets.a,
      {
        data: expressionlessData,
        sourceData: mixedData
      }
    )
  })
})
