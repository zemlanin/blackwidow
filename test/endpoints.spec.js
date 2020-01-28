import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { endpointMapper, extractEndpoints } from 'js/endpoints'

const cases = (
  fs.readdirSync(path.join(__dirname, 'cases'))
  .filter(name => name.match(/\.json$/))
)

describe('./endpoints', function () {
  describe('endpointMapper', function () {
    it('evaluate angular expressions', function () {
      assert.deepEqual(
        endpointMapper(
          {text: '2015-09-13'}, {},
          {text: "text | match:'\\\\d{4}-(\\\\d{2})-(\\\\d{2})' | format:'{2}.{1}'"}
        ),
        {text: '13.09'}
      )

      assert.deepEqual(
        endpointMapper(
          {project: {rev: '15.9.13(154321)a9324a63ed24'}}, {},
          {text: "project.rev | match:'(.*)\\\\((.*)\\\\)' | format:'{1} /{2}'"}
        ),
        {
          project: {rev: '15.9.13(154321)a9324a63ed24'},
          text: '15.9.13 /154321'
        }
      )

      assert.deepEqual(
        endpointMapper(
          {text: 'Mal|Zoe|Wash'}, {},
          {values: {
            _expr: "text | match:'[a-z]+':'ig' | map:_map",
            _map: {value: '$'}
          }}
        ),
        {
          text: 'Mal|Zoe|Wash',
          values: [
            {value: 'Mal'},
            {value: 'Zoe'},
            {value: 'Wash'}
          ]
        }
      )

      assert.deepEqual(
        endpointMapper(
          {text: 0}, {},
          {values: {
            _expr: 'text | juxt:_plus:_minus:_plus_minus',
            _plus: '$ | add:1',
            _minus: '$ | subtract:1',
            _plus_minus: '$ | add:-1'
          }}
        ),
        {text: 0, values: [1, 1, -1]}
      )
    })
  })

  describe('extractEndpoints', function () {
    describe('smoke', function () {
      for (const c of cases) {
        it(c, function () {
          extractEndpoints({
            dash: require('./cases/' + c)
          })
        })
      }
    })

    describe('cases/zen.json', function () {
      it('extracts correctly', function () {
        const dash = require('./cases/zen.json')
        const res = extractEndpoints({dash})
        const ref = res.dash.widgets.zen.endpoint._ref

        assert.deepEqual(res, {
          dash: {
            widgets: {
              zen: {
                ...dash.widgets.zen,
                endpoint: {
                  _ref: ref,
                  map: { text: '$' }
                }
              }
            }
          },
          endpoints: {
            [ref]: {
              ref: ref,
              plain: dash.widgets.zen.endpoint.plain,
              url: dash.widgets.zen.endpoint.url,
              schedule: dash.widgets.zen.endpoint.schedule
            }
          }
        })
      })
    })

    describe('cases/zen_v2.json', function () {
      it('extracts correctly', function () {
        const dash = require('./cases/zen_v2.json')
        const res = extractEndpoints({dash})
        const ref = 'github/zen'

        assert.deepEqual(res, {
          dash: dash,
          endpoints: {
            [ref]: {
              ref: ref,
              plain: dash.dataSources[ref].plain,
              url: dash.dataSources[ref].url,
              schedule: dash.dataSources[ref].schedule
            }
          }
        })
      })
    })
  })
})
