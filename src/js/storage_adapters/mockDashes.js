'use strict'

export var redTextUuid = "a84dc27d-2ffc-44bf-b8fb-f576c2e6161c"

export var mockDashes = {
  0: {
    widgets: {
      "c8ff8eef-aae4-4acc-8152-5a98fbd00d7c": {
        type: 'text',
        container: {
          position: [0, 0], size: [1, 1], background: 'red',
        },
        endpoint: "http://httpbin.org/get?text=http",
        endpointPath: "args",
      },
      "2020a34a-87d2-45f9-8157-524ec2ddb143": {
        type: 'text',
        container: {
          position: [1, 0], size: [5, 1], background: 'green',
        },
      },
      "0019b29f-3665-4b6a-846d-da4ecc9fcf03": {
        type: 'image',
        container: {
          position: [0, 1], size: [2, 3], background: 'grey',
        },
      },
      "7f6002f8-5408-4c68-b24b-3ed093f31aa7": {
        type: 'image',
        container: {
          position: [2, 1], size: [3, 5], background: 'blue',
        },
        // data: {
        //   src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        // },
      },
      "30e46823-3175-43a6-9a89-203eb763ae63": {
        type: 'text',
        container: {
          position: [5, 1], size: [1, 2], background: 'orange',
        },
      },
      "9c7231d7-1d08-4e0b-9993-d375f22c7a13": {
        type: 'text',
        container: {
          position: [0, 4], size: [2, 2], background: 'magenta',
        },
      },
      [redTextUuid]: {
        type: 'text',
        container: {
          position: [5, 3], size: [1, 3], background: 'black',
        },
        data: {
          id: 'redText',
        },
      },
      "a49953a1-2c7e-4ae6-b1b8-2d6767c0fd47": {
        type: 'image',
        container: {
          position: [6, 0], size: [4, 10], background: 'maroon',
        },
        // endpoint: "http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=1",
        // endpointPath: "data.0.images.original",
        // endpointMap: {"url": "src"},
      },
      "0cee2d04-6465-4a0f-b654-c67567ae91ec": {
        type: 'text',
        container: {
          position: [0, 6], size: [6, 4], background: 'purple',
        },
      },
    },
  },
  1: {
    widgets: {
      "107cbe9d-4358-46f7-af38-121e86b3c043": {
        type: 'text',
        container: {
          position: [0, 0], size: [2, 1], background: 'red',
        },
      },
      "f687e3f6-cbf7-4689-8637-8a34c5e7ccf6": {
        type: 'text',
        container: {
          position: [2, 0], size: [1, 1], background: 'green',
        },
      },
      "c5babd37-d873-4e17-bec7-24dcdce23556": {
        type: 'text',
        container: {
          position: [3, 0], size: [1, 1], background: 'grey',
        },
      },
      "5e9d9948-3e88-42d0-a8b6-4b2cc05d3f5f": {
        type: 'text',
        container: {
          position: [0, 1], size: [2, 2], background: 'blue',
        },
        data: {
          text: 'sup',
        },
      },
      "f90d007c-4993-4b4b-808c-584fe25fed67": {
        type: 'text',
        container: {
          position: [2, 1], size: [1, 1], background: 'orange',
        },
      },
      "88b74e9f-c250-4c17-a500-b66986de41fa": {
        type: 'text',
        container: {
          position: [2, 2], size: [1, 1], background: 'black',
        },
        data: {
          id: 'redText',
        },
      },
      "79a577d4-148a-4a9a-936a-6c51182a51c0": {
        type: 'text',
        container: {
          position: [3, 1], size: [1, 2], background: 'maroon',
        },
      },
    },
  },
  2: {
    widgets: {
      "f506cdc8-2226-4065-b253-42f1a3d6d260": {
        type: 'text',
        container: {
          position: [0, 0], size: [5, 1], background: 'red',
        },
      },
      "21485f3d-4fc5-4a99-b186-5ffbacec992c": {
        type: 'text',
        container: {
          position: [0, 1], size: [1, 3], background: 'green',
        },
      },
      "d80a8d8e-c16b-4983-aac8-a1634211514a": {
        type: 'text',
        container: {
          position: [1, 1], size: [1, 2], background: 'orange',
        },
      },
      "0f3e2274-82e7-43f3-9309-f9c622dade14": {
        type: 'text',
        container: {
          position: [2, 1], size: [1, 1], background: 'black',
        },
        data: {
          id: 'redText',
        }
      },
      "cf4ab34b-c41e-412e-b800-6f3940403b4b": {
        type: 'text',
        container: {
          position: [3, 1], size: [1, 3], background: 'magenta',
        },
      },
    },
  },
  3: {
    sizeX: 3,
    sizeY: 3,
    widgets: {
      "bfab262b-32ab-4edf-8201-89afe6cd639c": {
        type: 'image',
        container: {
          position: [0, 0], size: [2, 2],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
      "69e98268-0b3f-4e54-8e99-ad240e429582": {
        type: 'image',
        container: {
          position: [0, 2], size: [1, 1],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
      "41d766f6-f1c1-48c5-93a9-b16606cf6eb8": {
        type: 'image',
        container: {
          position: [1, 2], size: [1, 1],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
      "19cf66d7-d6c6-44c5-b7a9-c98165c50228": {
        type: 'image',
        container: {
          position: [2, 0], size: [1, 1],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
      "faac82c6-b3ce-46bf-8722-73462c0de30f": {
        type: 'image',
        container: {
          position: [2, 1], size: [1, 1],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
      "d6c4004b-a759-4689-9d6a-24aeab077dc6": {
        type: 'image',
        container: {
          position: [2, 2], size: [1, 1],
        },
        data: {
          src: 'https://dl.dropboxusercontent.com/s/xjg4w2am6et4881/bam.adam_scott.gif?dl=0',
        }
      },
    },
  },
}
