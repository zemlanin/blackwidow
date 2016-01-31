'use strict'

import _ from 'lodash'
import {h, Component} from 'preact'

export default class Table extends Component {
  shouldComponentUpdate(nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render() {
    var {data} = this.props
    data = data || {}

    return h("table", {
        id: data.id,
      },
      h("tbody",
        null,
        h("tr",
          null,
          _.map(
            data.columns,
            (column, i) => h("th",
              {key: `column_${i}`},
              column
            )
          )
        ),
        _.map(
          data.rows,
          (row, i) => h("tr",
            {key: `row_${i}`},
            _.map(
              row,
              (cell, j) => h("td",
                {key: `cell_${j}`},
                cell
              )
            )
          )
        )
      )
    )
  }
}
