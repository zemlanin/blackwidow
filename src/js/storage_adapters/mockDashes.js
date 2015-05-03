'use strict'

export default {
  0: {
    sizeX: 4,
    sizeY: 4,
    widgets: [
      {
        type: 'text',
        container: {
          position: [0, 0], size: [1, 1], background: 'red',
        },
      },
      {
        type: 'text',
        container: {
          position: [1, 0], size: [2, 1], background: 'green',
        },
      },
      {
        type: 'text',
        container: {
          position: [0, 1], size: [1, 1], background: 'grey',
        },
      },
      {
        type: 'text',
        container: {
          position: [1, 1], size: [1, 2], background: 'blue',
        },
        data: {
          text: 'sup',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 1], size: [1, 1], background: 'orange',
        },
      },
      {
        type: 'text',
        container: {
          position: [0, 2], size: [1, 1], background: 'magenta',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 2], size: [1, 1], background: 'black',
        },
        data: {
          id: 'redText',
        },
      },
      {
        type: 'text',
        container: {
          position: [3, 0], size: [1, 4], background: 'maroon',
        },
      },
      {
        type: 'text',
        container: {
          position: [0, 3], size: [3, 1], background: 'purple',
        },
      },
    ],
  },
  1: {
    sizeX: 4,
    sizeY: 3,
    widgets: [
      {
        type: 'text',
        container: {
          position: [0, 0], size: [2, 1], background: 'red',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 0], size: [1, 1], background: 'green',
        },
      },
      {
        type: 'text',
        container: {
          position: [3, 0], size: [1, 1], background: 'grey',
        },
      },
      {
        type: 'text',
        container: {
          position: [0, 1], size: [2, 2], background: 'blue',
        },
        data: {
          text: 'sup',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 1], size: [1, 1], background: 'orange',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 2], size: [1, 1], background: 'black',
        },
        data: {
          id: 'redText',
        },
      },
      {
        type: 'text',
        container: {
          position: [3, 1], size: [1, 2], background: 'maroon',
        },
      },
    ],
  },
  2: {
    sizeX: 5,
    sizeY: 4,
    widgets: [
      {
        type: 'text',
        container: {
          position: [0, 0], size: [5, 1], background: 'red',
        },
      },
      {
        type: 'text',
        container: {
          position: [0, 1], size: [1, 3], background: 'green',
        },
      },
      {
        type: 'text',
        container: {
          position: [1, 1], size: [1, 2], background: 'orange',
        },
      },
      {
        type: 'text',
        container: {
          position: [2, 1], size: [1, 1], background: 'black',
        },
        data: {
          id: 'redText',
        }
      },
      {
        type: 'text',
        container: {
          position: [3, 1], size: [1, 3], background: 'magenta',
        },
      },
    ]
  },
}
