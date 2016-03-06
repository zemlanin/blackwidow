import _ from 'lodash'
import React from 'react'
const h = React.createElement

import rd3 from 'react-d3'

import css from 'css/widgets/graph.css'

// const COLORS = [
//   '#00A500',
//   '#0FF',
//   '#F0F',
//   '#FF0',
//   '#F00',
//   '#00F',
// ]

const rd3BarChart = ([width, height], data, widgetId) => {
  return h(rd3.BarChart, {
    className: css.graph,
    hoverAnimation: false,
    data: [
      {values: data.values.map(({value}, i) => ({x: i, y: value}))},
    ],
    width,
    height,
    viewBoxObject: {
      x: 0,
      y: 0,
      width,
      height,
    },
    axesColor: 'white',
  })
}

const rd3LineChart = ([width, height], data, widgetId) => {
  return h(rd3.LineChart, {
    className: css.graph,
    hoverAnimation: false,
    data: [
      {values: data.values.map(({value}, i) => ({x: i, y: value, text: value}))},
    ],
    width,
    height,
    viewBoxObject: {
      x: 0,
      y: 0,
      width,
      height,
    },
    axesColor: 'white',
  })
}

export default class Graph extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const {data = {}, widgetId, container} = this.props
    if (data && data.limit && data.values) { data.values.splice(data.limit) }

    if (!data.values || !container.pixelSize) { return h('div') }

    const {values, sortBy} = data
    let parsedValues = _.map(values, (v) => v.value ? v : {value: v})

    if (sortBy) {
      parsedValues = _.orderBy(
        parsedValues,
        [sortBy.replace(/^-/, '')],
        [!sortBy.startsWith('-')]
      )
    }

    switch (data && data.style) {
      case 'line-chart':
        return rd3LineChart(container.pixelSize, _.merge({}, data, {values: parsedValues}), widgetId)
      case 'bar-chart':
      default:
        return rd3BarChart(container.pixelSize, _.merge({}, data, {values: parsedValues}), widgetId)
    }
  }
}
