import assert from 'assert'
import { endpointMapper } from '../src/js/endpoints'

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
        {text: '15.9.13 /154321'}
      )

      assert.deepEqual(
        endpointMapper(
          {text: 'Mal|Zoe|Wash'}, {},
          {values: {
            _expr: "text | match:'[a-z]+':'ig' | map:_map",
            _map: {value: '$'},
          }}
        ),
        {values: [
          {value: 'Mal'},
          {value: 'Zoe'},
          {value: 'Wash'},
        ]}
      )

      assert.deepEqual(
        endpointMapper(
          {text: 0}, {},
          {values: {
            _expr: 'text | juxt:_plus:_minus:_plus_minus',
            _plus: '$ | +:1',
            _minus: '$ | -:1',
            _plus_minus: '$ | +:-1',
          }}
        ),
        {values: [1, 1, -1]}
      )
    })
  })
})
