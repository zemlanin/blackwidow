'use strict'

import {hawkeyeEndpoint} from 'config'

export var mockDashes = {
  0: {
    widgets: {
      "2020a34a-87d2-45f9-8157-524ec2ddb143": {
        type: 'text',
        container: {
          position: [0, 0], size: [6, 2], background: 'green',
        },
        endpoint: hawkeyeEndpoint+'/duty',
        endpointMethod: 'POST',
        data: {
          note: '/duty',
        }
      },
      "30e46823-3175-43a6-9a89-203eb763ae63": {
        type: 'text',
        container: {
          position: [0, 2], size: [6, 2], background: 'orange',
        },
        endpoint: hawkeyeEndpoint+'/text?type=default',
        endpointMethod: 'POST',
        data: {
          note: '/text default',
        }
      },
      "30e46823-3175-43a6-9a89-203eb763fe63": {
        type: 'text',
        container: {
          position: [0, 4], size: [6, 2], background: 'orange',
        },
        endpoint: hawkeyeEndpoint+'/text?type=quote',
        endpointMethod: 'POST',
        data: {
          note: '/text quote',
        }
      },
      "a49953a1-2c7e-4ae6-b1b8-2d6767c0fd47": {
        type: 'image',
        container: {
          position: [6, 0], size: [4, 10], background: 'maroon',
        },
        endpoint: hawkeyeEndpoint+"/text?type=gif",
        endpointMap: {"text": "src"},
        endpointMethod: 'POST',
        data: {
          note: '/text gif',
        }
      },
      "c8ff8eef-aae4-4acc-8152-5a98fbd00ddd": {
        type: 'image',
        container: {
          position: [0, 6], size: [3, 4], background: 'maroon',
        },
        endpoint: hawkeyeEndpoint+"/text?type=uno",
        endpointMap: {"text": "src"},
        endpointMethod: 'POST',
        data: {
          note: '/text uno',
        }
      },
      "c8ff8eef-aae4-4acc-8152-5a98fbd00d9d": {
        type: 'image',
        container: {
          position: [3, 6], size: [3, 4], background: 'maroon',
        },
        endpoint: hawkeyeEndpoint+"/text?type=dos",
        endpointMap: {"text": "src"},
        endpointMethod: 'POST',
        data: {
          note: '/text dos',
        }
      }
    },
  }
}
