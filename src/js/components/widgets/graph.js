'use strict'

import _ from 'lodash'
import React from 'react'

const TOP_BAR_LINE_Y = 150
const BOTTOM_BAR_LINE_Y = 650

const LEFT_BAR_LINE_X = 100
const RIGHT_BAR_LINE_X = 900

const BAR_SPACING = 25

const COLORS = [
  '#00A500',
  '#0FF',
  '#F0F',
  '#FF0',
  '#F00',
  '#00F',
]

function getTextWidth(text) {
  return 33 * (text || '').toString().length // for font-size 50
}

function getTextHeightShift(text, width) {
  const valueLabelWidth = getTextWidth(text)
  return width >= valueLabelWidth
        ? 0
        : valueLabelWidth * Math.sin(Math.acos(width / valueLabelWidth))
}

function barChart(data, widgetId) {
  let {values, baseValues, sortBy} = data || {}
  baseValues = baseValues || {}
  values = _.map(values, v => v.value ? v : {value: v})

  if (sortBy) {
    values = _.sortByOrder(
      values,
      [sortBy.replace(/^-/, '')],
      [!sortBy.startsWith('-')]
    )
  }

  let {min, max} = baseValues

  if (min === undefined) {
    min = _.min(values, 'value').value
  }

  if (max === undefined) {
    max = _.max(values, 'value').value
  }

  const sizeCoef = (BOTTOM_BAR_LINE_Y - TOP_BAR_LINE_Y) / (max - min)

  let lineY = BOTTOM_BAR_LINE_Y
  if (min < 0) {
    lineY = TOP_BAR_LINE_Y + max * sizeCoef
  }

  const spaceBetweenBars = (RIGHT_BAR_LINE_X - LEFT_BAR_LINE_X - BAR_SPACING) / values.length
  const barWidth = spaceBetweenBars - BAR_SPACING

  const valueLabelShift = _.max(_.map(values, v => getTextHeightShift(v.value, barWidth)))
  const barLabelShift = _.max(_.map(values, v => getTextHeightShift(v.text, barWidth)))

  return React.createElement("svg", {
      xmlns: "http://www.w3.org/svg/2000",
      width: "100%",
      height: "100%",
      viewBox: "0 0 1000 1000",
      preserveAspectRatio: "xMidYMid",
    },
    React.createElement("line", {
      stroke: "#555",
      x1: LEFT_BAR_LINE_X,
      x2: RIGHT_BAR_LINE_X,
      y1: lineY + 3,
      y2: lineY + 3,
      strokeWidth: 6,
    }),
    _.map(values, (el, i) => {
      const color = el.color || COLORS[i % COLORS.length]
      const x = LEFT_BAR_LINE_X + BAR_SPACING + spaceBetweenBars * i
      let y, height

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
        height = -value * sizeCoef
      } else {
        y = TOP_BAR_LINE_Y + (max - value) * sizeCoef
        height = lineY - y
      }

      return [
        React.createElement("rect", {
          key: 'bar' + i,
          fill: color,
          x: x,
          y: y,
          width: barWidth,
          height: Math.max(height, 6),
          "data-value": value,
        }),

        React.createElement("path", {
          key: 'valuelabelpath' + i,
          id: `path_value_${widgetId}_${i}`,
          d: [
            `M ${x} ${y}`,
            `L ${x + barWidth} ${y - valueLabelShift}`
          ].join(' ')
        }),
        React.createElement("text", {
            key: 'value_label' + i,
            fill: color,
            stroke: color,
            fontSize: 50,
          },
          React.createElement("textPath", {
            xlinkHref: `#path_value_${widgetId}_${i}`,
          }, el.value)
        ),

        React.createElement("path", {
          key: 'labelpath' + i,
          id: `path_bar_${widgetId}_${i}`,
          d: [
            `M ${x} ${BOTTOM_BAR_LINE_Y + 50 + barLabelShift}`,
            `L ${x + barWidth} ${BOTTOM_BAR_LINE_Y + 50}`
          ].join(' ')
        }),
        React.createElement("text", {
            key: 'label' + i,
            fill: color,
            stroke: color,
            fontSize: 50,
          },
          React.createElement("textPath", {
            xlinkHref: `#path_bar_${widgetId}_${i}`,
          }, el.text)
        ),
      ]
    }),
    null // this allows trailing commas
  )
}

function lineChart(data, widgetId) {
  let {values, baseValues, sortBy} = data || {}
  baseValues = baseValues || {}
  values = _.map(values, v => v.value ? v : {value: v})

  if (sortBy) {
    values = _.sortByOrder(
      values,
      [sortBy.replace(/^-/, '')],
      [!sortBy.startsWith('-')]
    )
  }

  let {min, max} = baseValues

  if (min === undefined) {
    min = _.min(values, 'value').value
  }

  if (max === undefined) {
    max = _.max(values, 'value').value
  }

  const sizeCoef = (BOTTOM_BAR_LINE_Y - TOP_BAR_LINE_Y) / (max - min)

  let lineY = BOTTOM_BAR_LINE_Y
  if (min < 0) {
    lineY = TOP_BAR_LINE_Y + max * sizeCoef
  }

  const spaceBetweenBars = (RIGHT_BAR_LINE_X - LEFT_BAR_LINE_X - BAR_SPACING) / values.length

  const pathPoints = _.map(values, (el, i) => {
    const x = LEFT_BAR_LINE_X + BAR_SPACING + spaceBetweenBars * (i + 0.5)

    let value
    if (el.value < min) {
      value = min
    } else if (el.value > max) {
      value = max
    } else {
      value = el.value
    }

    const y = TOP_BAR_LINE_Y + (max - value) * sizeCoef
    return {el, x, y}
  })

  return React.createElement("svg", {
      xmlns: "http://www.w3.org/svg/2000",
      width: "100%",
      height: "100%",
      viewBox: "0 0 1000 1000",
      preserveAspectRatio: "xMidYMid",
    },
    React.createElement("line", {
      stroke: "#555",
      x1: LEFT_BAR_LINE_X,
      x2: RIGHT_BAR_LINE_X,
      y1: lineY + 3,
      y2: lineY + 3,
      strokeWidth: 6,
    }),
    React.createElement("path", {
      stroke: "white",
      fill: "none",
      strokeWidth: 6,
      d: _.map(pathPoints, ({x, y}, i) => {
        if (i === 0) {
          return `M ${x} ${y}`
        }
        return `L ${x} ${y}`
      }).join(' ')
    }),
    _.map(pathPoints, ({x, y, el}, i) => {
      const color = el.color || COLORS[i % COLORS.length]
      return React.createElement("ellipse", {
        key: 'value_wrapper_' + i,
        cx: x,
        cy: y,
        rx: Math.max(getTextWidth('+'), getTextWidth(el.value) / 1.5),
        ry: getTextWidth('+'),
        fill: "black",
        stroke: color,
        strokeWidth: 6,
      })
    }),
    _.map(pathPoints, ({x, y, el}, i) => {
      const color = el.color || COLORS[i % COLORS.length]
      return React.createElement("text", {
        key: 'value_label_' + i,
        x: x - (getTextWidth(el.value) / 2),
        y: y + 18,
        fill: color,
        stroke: color,
        fontSize: 50,
      }, el.value)
    }),
    null // this allows trailing commas
  )
}

export default ({data, widgetId}) => {
  switch (data && data.style) {
    case 'line-chart':
      return lineChart(data, widgetId)
    case 'bar-chart':
    default:
      return barChart(data, widgetId)
  }
}