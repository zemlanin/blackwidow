import _ from 'lodash'
import React from 'react'
const h = React.createElement

import rd3 from 'react-d3'

import css from 'css/widgets/graph.css'

const COLORS = [
  '#00A500',
  '#0FF',
  '#F0F',
  '#FF0',
  '#F00',
  '#00F'
]

const rd3BarChart = ([width, height], data, widgetId) => {
  return h(rd3.BarChart, {
    className: css.graph,
    hoverAnimation: false,
    gridHorizontal: true,
    data: data.series,
    width,
    height,
    viewBoxObject: {
      x: 0,
      y: 0,
      width,
      height
    },
    axesColor: 'white'
  })
}

const rd3LineChart = ([width, height], data, widgetId) => {
  return h(rd3.LineChart, {
    className: css.graph,
    hoverAnimation: false,
    gridHorizontal: true,
    legend: _.some(data.series, (s) => s.name),
    data: data.series,
    colors: (i) => data.series[i].color || COLORS[i % COLORS.length],
    width,
    height,
    viewBoxObject: {
      x: 0,
      y: 0,
      width,
      height
    },
    axesColor: 'white'
  })
}

export default class Graph extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const {data = {}, widgetId, container} = this.props

    let series = _.cloneDeep(data.series)
    let values = _.cloneDeep(data.values)

    if ((!values && !series) || !container.pixelSize) { return h('div') }
    if (values && !series) { series = [{values}] }

    series = series.map((s, seriesIdx) => {
      s.strokeWidth = data.strokeWidth || 5
      s.values = s.values.map(
        (v, i) => _.isNumber(v) ? {x: i, y: v} : _.defaults(v, {x: i})
      )

      return s
    })

    switch (data.style) {
      case 'line-chart':
        return rd3LineChart(container.pixelSize, {series}, widgetId)
      case 'bar-chart':
      default:
        return rd3BarChart(container.pixelSize, {series}, widgetId)
    }
  }
}
