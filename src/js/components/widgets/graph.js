import _ from 'lodash'
import React from 'react'
const Component = React.Component
const h = React.createElement

const TOP_BAR_LINE_Y = (height) => height * 0.15
const BOTTOM_BAR_LINE_Y = (height, axesText = true) => axesText ? height * 0.65 : height * 0.85

const LEFT_BAR_LINE_X = (width) => width * 0.05
const RIGHT_BAR_LINE_X = (width) => width * 0.95

const BAR_SPACING = (width) => width * 0.025

const COLORS = [
  '#00A500',
  '#0FF',
  '#F0F',
  '#FF0',
  '#F00',
  '#00F',
]

const FONT_SIZE = 20

function getTextWidth (text) {
  return FONT_SIZE * 0.66 * (text || '').toString().length
}

function getTextHeightShift (text, width) {
  const valueLabelWidth = getTextWidth(text)
  return width >= valueLabelWidth
    ? 0
    : valueLabelWidth * Math.sin(Math.acos(width / valueLabelWidth))
}

function barChart ([sizeX, sizeY], data, widgetId) {
  const width = sizeX * 100
  const height = sizeY * 100

  let {values, baseValues, sortBy} = data || {}
  baseValues = baseValues || {}
  values = _.map(values, (v) => _.isObject(v) ? v : {value: v})

  if (sortBy) {
    values = _.orderBy(
      values,
      [sortBy.replace(/^-/, '')],
      [!sortBy.startsWith('-')]
    )
  }

  let {min, max} = baseValues

  if (min === undefined) {
    min = _.minBy(values, 'value').value
  }

  if (max === undefined) {
    max = _.maxBy(values, 'value').value
  }

  const sizeCoef = (BOTTOM_BAR_LINE_Y(height) - TOP_BAR_LINE_Y(height)) / (max - min)

  let lineY = BOTTOM_BAR_LINE_Y(height)
  if (min < 0) {
    lineY = TOP_BAR_LINE_Y(height) + max * sizeCoef
  }

  const spaceBetweenBars = (RIGHT_BAR_LINE_X(width) - LEFT_BAR_LINE_X(width) - BAR_SPACING(width)) / values.length
  const barWidth = spaceBetweenBars - BAR_SPACING(width)

  const valueLabelShift = _.max(_.map(values, (v) => getTextHeightShift(v.value, barWidth)))
  const barLabelShift = _.max(_.map(values, (v) => getTextHeightShift(v.text, barWidth)))

  return h('svg', {
    width: '100%',
    height: '100%',
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'xMidYMid',
  },
    h('line', {
      stroke: '#555',
      x1: LEFT_BAR_LINE_X(width),
      x2: RIGHT_BAR_LINE_X(width),
      y1: lineY + 3,
      y2: lineY + 3,
      strokeWidth: 6,
    }),
    ..._.map(values, (el, i) => {
      const color = el.color || data.color || COLORS[i % COLORS.length]
      const x = LEFT_BAR_LINE_X(width) + BAR_SPACING(width) + spaceBetweenBars * i
      let y, barHeight

      let value
      if (el.value < min) {
        value = min
      } else if (el.value > max) {
        value = max
      } else {
        value = el.value
      }

      if (value < 0) {
        y = lineY
        barHeight = -value * sizeCoef
      } else {
        y = TOP_BAR_LINE_Y(height) + (max - value) * sizeCoef
        barHeight = lineY - y
      }

      return [
        h('rect', {
          key: 'bar' + i,
          fill: color,
          x: x,
          y: y,
          width: barWidth,
          height: Math.max(barHeight, 6),
          'data-value': value,
        }),

        h('path', {
          key: 'valuelabelpath' + i,
          id: `path_value_${widgetId}_${i}`,
          d: `M ${x} ${y}
              L ${x + width} ${y - valueLabelShift}`,
        }),
        h('text', {
          key: 'value_label' + i,
          fill: color,
          stroke: color,
          fontSize: FONT_SIZE,
        },
          h('textPath', {
            'xlinkHref': `#path_value_${widgetId}_${i}`,
          }, el.value)
        ),

        h('path', {
          key: 'labelpath' + i,
          id: `path_bar_${widgetId}_${i}`,
          d: `M ${x} ${BOTTOM_BAR_LINE_Y(height) + 50 + barLabelShift}
              L ${x + width} ${BOTTOM_BAR_LINE_Y(height) + 50}`,
        }),
        h('text', {
          key: 'label' + i,
          fill: color,
          stroke: color,
          fontSize: FONT_SIZE,
        },
          h('textPath', {
            'xlinkHref': `#path_bar_${widgetId}_${i}`,
          }, el.text)
        ),
      ]
    }),
    null // this allows trailing commas
  )
}

function lineChart ([sizeX, sizeY], data, widgetId) {
  const width = sizeX * 100
  const height = sizeY * 100

  let {values, baseValues, sortBy} = data || {}
  baseValues = baseValues || {}
  values = _.map(values, (v) => v.value ? v : {value: v})

  if (sortBy) {
    values = _.orderBy(
      values,
      [sortBy.replace(/^-/, '')],
      [!sortBy.startsWith('-')]
    )
  }

  let {min, max} = baseValues

  if (min === undefined) {
    min = _.minBy(values, 'value').value
  }

  if (max === undefined) {
    max = _.maxBy(values, 'value').value
  }

  const sizeCoef = (BOTTOM_BAR_LINE_Y(height, false) - TOP_BAR_LINE_Y(height)) / (max - min)

  let lineY = BOTTOM_BAR_LINE_Y(height, false)
  if (min < 0) {
    lineY = TOP_BAR_LINE_Y(height) + max * sizeCoef
  }

  const spaceBetweenBars = (RIGHT_BAR_LINE_X(width) - LEFT_BAR_LINE_X(width) - BAR_SPACING(width)) / values.length

  const pathPoints = _.map(values, (el, i) => {
    const x = LEFT_BAR_LINE_X(width) + BAR_SPACING(width) + spaceBetweenBars * (i + 0.5)

    let value
    if (el.value < min) {
      value = min
    } else if (el.value > max) {
      value = max
    } else {
      value = el.value
    }

    const y = TOP_BAR_LINE_Y(height) + (max - value) * sizeCoef
    return {el, x, y}
  })

  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    width: '100%',
    height: '100%',
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'xMidYMid',
  },
    h('line', {
      stroke: '#555',
      x1: LEFT_BAR_LINE_X(width),
      x2: RIGHT_BAR_LINE_X(width),
      y1: lineY + 3,
      y2: lineY + 3,
      strokeWidth: 6,
    }),
    ..._.map(data.lines, ({x, y}, i) => {
      let lineProps = {
        key: 'extraline_' + x + '_' + y,
        stroke: '#555',
        strokeWidth: 6,
      }

      if (y !== undefined) {
        lineProps.x1 = LEFT_BAR_LINE_X(width)
        lineProps.x2 = RIGHT_BAR_LINE_X(width)
        lineProps.y1 = lineProps.y2 = TOP_BAR_LINE_Y(height) + y * sizeCoef + 3
      }

      return h('line', lineProps)
    }),
    h('path', {
      stroke: 'white',
      fill: 'none',
      strokeWidth: 6,
      d: _.map(pathPoints, ({x, y}, i) => {
        if (i === 0) {
          return `M ${x} ${y}`
        }
        return `L ${x} ${y}`
      }).join(' '),
    }),
    ..._.map(data.labelStyle === 'none' ? null : pathPoints, ({x, y, el}, i) => {
      const color = el.color || data.color || COLORS[i % COLORS.length]
      return [
        h('ellipse', {
          key: 'value_wrapper_' + i,
          cx: x,
          cy: y,
          rx: Math.max(getTextWidth('+'), getTextWidth(el.value) / 1.5),
          ry: getTextWidth('+'),
          fill: 'black',
          stroke: color,
          strokeWidth: 6,
        }),
        h('text', {
          key: 'value_label_' + i,
          x: x - (getTextWidth(el.value) / 2),
          y: y + 18,
          fill: color,
          stroke: color,
          fontSize: FONT_SIZE,
        }, el.value),
      ]
    }),
    null // this allows trailing commas
  )
}

export default class Graph extends Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const {data = {}, widgetId, container} = this.props
    if (data && data.limit && data.values) { data.values.splice(data.limit) }

    if (!data.values) { return h('div') }

    switch (data && data.style) {
      case 'line-chart':
        return lineChart(container.size, data, widgetId)
      case 'bar-chart':
      default:
        return barChart(container.size, data, widgetId)
    }
  }
}
