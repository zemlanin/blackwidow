import _ from 'lodash'
import React from 'react'
const Component = React.Component
const h = React.createElement

export default class Table extends Component {
  shouldComponentUpdate (nextProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render ({data = {}}) {
    return h('table', {
      id: data.id,
    },
      h('tbody',
        null,
        h('tr',
          null,
          _.map(
            data.columns,
            (column, i) => h('th',
              {key: `column_${i}`},
              column
            )
          )
        ),
        _.map(
          data.rows,
          (row, i) => h('tr',
            {key: `row_${i}`},
            _.map(
              row,
              (cell, j) => h('td',
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
