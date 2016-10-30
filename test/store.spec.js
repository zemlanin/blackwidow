import Rx from 'rx'
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { getDash, extractDataMapping, keepComputableData } from 'js/store'

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

  describe('extractDataMapping', function () {
    const expressionlessData = { text: 'lol' }
    const expressionData = { src: {_expr: '$', _source: 'ref'} }
    const mixedData = { text: 'lol', src: {_expr: '$', _source: 'ref'} }

    const dashWithData = (data) => ({dash: {widgets: {a: {data}}}})

    assert.deepEqual(
      extractDataMapping(dashWithData(expressionlessData)).dash.widgets.a,
      {
        data: expressionlessData,
        dataMapping: {}
      }
    )

    assert.deepEqual(
      extractDataMapping(dashWithData(expressionData)).dash.widgets.a,
      {
        data: {},
        dataMapping: expressionData
      }
    )

    assert.deepEqual(
      extractDataMapping(dashWithData(mixedData)).dash.widgets.a,
      {
        data: expressionlessData,
        dataMapping: expressionData
      }
    )
  })

  describe('keepComputableData', function () {
    assert.deepEqual(null, keepComputableData({}), 'ø')
    assert.deepEqual(null, keepComputableData({a: 1}), 'a')
    assert.deepEqual(null, keepComputableData({b: [1, 2, 3]}), 'b')
    assert.deepEqual(null, keepComputableData({c: [{}, {}, {}]}), 'c')
    assert.deepEqual(null, keepComputableData({d: {_expr: '$'}}), 'd')
    assert.deepEqual(
      {e: {_expr: '$', _source: 'ref'}},
      keepComputableData({e: {_source: 'ref'}}),
      'e'
    )
    assert.deepEqual(
      {f: {a: {_expr: '$', _source: 'ref'}}},
      keepComputableData({f: {a: {_source: 'ref'}}}),
      'f'
    )
    assert.deepEqual(
      {g: {a: {_expr: '$', _source: 'ref'}}},
      keepComputableData({g: {a: {_source: 'ref'}, b: {}}, g1: {}}),
      'g'
    )
  })
})
