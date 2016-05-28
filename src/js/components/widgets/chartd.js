import _ from 'lodash'
import React from 'react'
const h = React.createElement

import { imageHolder } from 'css/widgets/image'

const b62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function encode (data, min, max) {
  const dim = Math.max(max - min, 0)

  if (dim === 0) {
    return _.repeat(b62[0], data.length)
  }

  return data.map((y, i) => {
    const index = parseInt((b62.length - 1) * (y - min) / dim)

    return b62[index] || b62[0]
  }).join('')
}

export default class Chartd extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render () {
    const {data = {}, container} = this.props

    let series = _.cloneDeep(data.series)
    let values = _.cloneDeep(data.values)

    if ((!values && !series) || !container.pixelSize) { return h('div') }
    if (values && !series) { series = [{values, stroke: data.stroke}] }

    const allValues = _(series).map('values').flatten().value()

    const ymax = data.ymax != null ? data.ymax : Math.max.apply(null, allValues)
    const ymin = data.ymin != null ? data.ymin : Math.min.apply(null, allValues)

    const datasets = series
      .map((s, seriesIdx) => {
        const dataset = `d${seriesIdx}=${encode(s.values, ymin, ymax)}`
        const stroke = s.stroke ? `&s${seriesIdx}=${s.stroke}` : ''
        const fill = s.fill ? `&f${seriesIdx}=${s.fill}` : ''

        return dataset + stroke + fill
      })
      .join('&')

    const url = `url(https://chartd.co/a.svg?${[
      `w=${parseInt(container.pixelSize[0] / (data.scale || 3))}`,
      `h=${parseInt(container.pixelSize[1] / (data.scale || 3))}`,
      datasets,
      `ymin=${ymin}`,
      `ymax=${ymax}`,
      data.xmin ? `xmin=${data.xmin}` : '',
      data.xmax ? `xmax=${data.xmax}` : '',
      data.tz ? `tz=${data.tz}` : '',
      data.t ? `t=${encodeURIComponent(data.t).replace('%20', '+')}` : '',
      data.step ? 'step=1' : '',
      data.hl ? 'hl=1' : '',
      data.ol ? 'ol=1' : '',
      data.or ? 'or=1' : ''
    ].filter(_.trim).join('&')})`

    return h('div', {
      className: imageHolder,
      style: {
        backgroundImage: url
      }
    })
  }
}
