import assert from 'assert'
import { filters } from 'js/expressions_filters'

describe('./expressions_filters', function () {
  describe('get', function () {
    it('returns object value', function () {
      assert.deepEqual(
        undefined, filters.get({}, 'x')
      )

      assert.deepEqual(
        1, filters.get({x: 1}, 'x')
      )

      assert.deepEqual(
        2, filters.get({x: {y: 2}}, 'x.y')
      )
    })
  })

  describe('map', function () {
    it('returns original value when mapping with $', function () {
      assert.deepEqual(
        [], filters.map([], '$')
      )

      assert.deepEqual(
        [1, 2, 3], filters.map([1, 2, 3], '$')
      )
    })

    it('applies other filters', function () {
      assert.deepEqual(
        [1, 2, 3], filters.map([[1], [2], [3]], "$ | get:'0'")
      )
    })

    it('applies nested expressions', function () {
      assert.deepEqual(
        [[2], [3], [4]], filters.map([[1], [2], [3]], "$ | map:'$ | +:1'")
      )
    })

    it('works with expression structures', function () {
      assert.deepEqual([{value: 1}, {value: 2}, {value: 3}], filters.map([1, 2, 3], { value: '$' }))
    })
  })

  describe('format', function () {
    it('works with string as a value', function () {
      assert.deepEqual(
        'lol', filters.format('lol', '{}')
      )

      assert.deepEqual(
        'loool', filters.format('o', 'l{}{}{}l')
      )

      assert.deepEqual(
        'labcl', filters.format('abc', 'l{0}{1}{2}l')
      )
    })

    it('works with array as a value', function () {
      assert.deepEqual(
        'ax', filters.format(['a', 'b', 'c'], '{0}x')
      )

      assert.deepEqual(
        'bxc', filters.format(['a', 'b', 'c'], '{1}x{2}')
      )

      assert.deepEqual(
        'a,b,cx', filters.format(['a', 'b', 'c'], '{}x')
      )
    })

    it('works with object as a value', function () {
      assert.deepEqual(
        'x%', filters.format({a: 'x', b: 'y'}, '{a}%')
      )

      assert.deepEqual(
        'x%y', filters.format({a: 'x', b: 'y'}, '{a}%{b}')
      )

      assert.deepEqual(
        'yyy', filters.format({a: 'x', b: 'y'}, '{b}{b}{b}')
      )
    })
  })

  describe('match', function () {
    it('works without flags', function () {
      assert.deepEqual('l', filters.match('lol', '^l')[0])
      assert.deepEqual(null, filters.match('lol', '^o'))
      assert.deepEqual(1, filters.match('loool', 'o').length)
      assert.deepEqual(null, filters.match('LOL', '^l'))
      assert.deepEqual('0', filters.match('l0l', '\\d+')[0])
      assert.deepEqual(null, filters.match('lol\nabc', '^a'))
    })

    it('works with flags', function () {
      assert.deepEqual(1, filters.match('lol\nabc', '^a', 'm').length)
      assert.deepEqual(3, filters.match('loool', 'o', 'g').length)
      assert.deepEqual(2, filters.match('lol\nlol', '^l', 'gm').length)
      assert.deepEqual('L', filters.match('LOL', '^l', 'i')[0])
    })
  })

  describe('juxt', function () {
    it('works with empty list', function () {
      assert.deepEqual([], filters.juxt('lol'))
    })

    it('works with expressions', function () {
      assert.deepEqual(['lol', 1], filters.juxt('lol', '$', '1'))
      assert.deepEqual([3, 'ololo'], filters.juxt('lol', "$ | get:'length'", "$ | format:'o{}o'"))
    })

    it('works with expression structures', function () {
      assert.deepEqual([{value: 3}], filters.juxt('lol', { value: "$ | get:'length'" }))
    })
  })
})

// timeUntil
// timeSince
// ['+']
// ['-']
