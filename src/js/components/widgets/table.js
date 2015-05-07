'use strict'

import _ from 'lodash'
import React, {DOM} from 'react'

export default React.createClass({
  render: function() {
    var {data} = this.props
    data = data || {}

    return DOM.table({
        id: data.id,
      },
      DOM.tbody(
        null,
        DOM.tr(
          null,
          _.map(
            data.columns,
            (column, i) => DOM.th(
              {key: `column_${i}`},
              column
            )
          )
        ),
        _.map(
          data.rows,
          (row, i) => DOM.tr(
            {key: `row_${i}`},
            _.map(
              row,
              (cell, j) => DOM.td(
                {key: `cell_${j}`},
                cell
              )
            )
          )
        )
      )
    )
  }
})
