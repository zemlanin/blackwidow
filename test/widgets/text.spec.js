import assert from 'assert'
import React from 'react'
import { shallow } from 'enzyme'
import Text from 'js/components/widgets/text'

describe('./components/widgets/text', function () {
  it('renders empty', function () {
    shallow(React.createElement(Text, {}))
  })

  it('renders text', function () {
    const r = shallow(React.createElement(Text, {data: {text: 'lol'}}))

    assert.ok(r.contains('lol'))
  })

  it('renders note', function () {
    const r = shallow(React.createElement(Text, {data: {note: 'rofl'}}))

    assert.ok(r.contains('rofl'))
  })

  it('renders text and note', function () {
    const r = shallow(React.createElement(Text, {data: {text: 'lol', note: 'rofl'}}))

    assert.ok(r.contains('lol'))
    assert.ok(r.contains('rofl'))
  })

  it('applies fontSize', function () {
    const r = shallow(React.createElement(Text, {data: {text: 'lol'}, container: {fontSize: '13px'}}))
    const r2 = shallow(React.createElement(Text, {data: {text: 'lol'}}))

    assert.ok(r.someWhere((n) => n.props().style.fontSize === '13px'))
    assert.ok(r2.someWhere((n) => n.props().style.fontSize && n.props().style.fontSize !== '13px'))
  })
})
