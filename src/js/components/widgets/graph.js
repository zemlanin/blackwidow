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

export default ({data, widgetId}) => {
  data = data || {}

  var {values, baseValues, sortBy} = data
  baseValues = baseValues || {}
  values = _.map(values, v => v.value ? v : {value: v})

  if (sortBy) {
    values = _.sortByOrder(
      values,
      [sortBy.replace(/^-/, '')],
      [!sortBy.startsWith('-')]
    )
  }

  var {min, max} = baseValues

  if (min === undefined) {
    min = _.min(values, 'value').value
  }

  if (max === undefined) {
    max = _.max(values, 'value').value
  }

  var baseDelta = max - min
  const sizeCoef = (BOTTOM_BAR_LINE_Y - TOP_BAR_LINE_Y) / baseDelta

  var lineY = BOTTOM_BAR_LINE_Y
  if (min < 0) {
    lineY = TOP_BAR_LINE_Y + max * sizeCoef
  }

  var spaceBetweenBars = (RIGHT_BAR_LINE_X - LEFT_BAR_LINE_X - BAR_SPACING) / values.length

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
      const value = el.value
      const color = el.color || COLORS[i % COLORS.length]

      var x = LEFT_BAR_LINE_X + BAR_SPACING + spaceBetweenBars * i
      var y, height

      if (value < 0) {
        y = lineY
        height = -value * sizeCoef
      } else {
        y = TOP_BAR_LINE_Y + (max - value) * sizeCoef
        height = lineY - y
      }

      return [
        React.createElement("rect", {
          key: '0' + i,
          fill: color,
          x: x,
          y: y,
          width: spaceBetweenBars - BAR_SPACING,
          height: Math.max(height, 6),
          "data-value": value,
        }),
        React.createElement("path", {
          key: '1' + i,
          id: `path_bar_${widgetId}_${i}`,
          d: [
            `M ${x + BAR_SPACING} ${BOTTOM_BAR_LINE_Y + 25 * 2}`,
            `L ${800 + x + BAR_SPACING} ${300 + BOTTOM_BAR_LINE_Y + 25 * 2}`
          ].join(' ')
        }),
        React.createElement("text", {
            key: '2' + i,
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
