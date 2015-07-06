'use strict'

import {hawkeyeEndpoint} from 'config'

export var mockDashes = {
  0: {
    widgets: {
      "2020a34a-87d2-45f9-8157-524ec2ddb143": {
        type: 'text',
        container: {
          position: [0, 0], size: [5, 2], background: 'green',
        },
        endpoint: hawkeyeEndpoint+'/duty',
        endpointMethod: 'POST',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 60 * 60 * 1000,
        },
        data: {
          note: '/duty',
        }
      },
      "30e46823-3175-43a6-9a89-203eb763ae63": {
        type: 'text',
        container: {
          position: [5, 0], size: [5, 2], background: 'orange',
        },
        endpoint: hawkeyeEndpoint+'/text?type=default',
        endpointMethod: 'POST',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 10 * 60 * 1000,
        },
        data: {
          note: '/text default',
        }
      },
      "30e46823-3175-43a6-9a89-203eb763fe63": {
        type: 'text',
        container: {
          position: [0, 2], size: [6, 3], background: 'orange',
        },
        endpoint: hawkeyeEndpoint+'/text?type=quote',
        endpointMethod: 'POST',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 20 * 60 * 1000,
        },
        data: {
          note: '/text quote',
        }
      },
      "a49953a1-2c7e-4ae6-b1b8-2d6767c0fd47": {
        type: 'image',
        container: {
          position: [6, 2], size: [4, 8], background: 'maroon',
        },
        endpoint: hawkeyeEndpoint+"/text?type=gif",
        endpointMap: {"text": "src"},
        endpointMethod: 'POST',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 15 * 60 * 1000,
        },
        data: {
          note: '/text gif',
        }
      },
      "c8ff8eef-aae4-4acc-8152-5a98fbd00ddd": {
        type: 'image',
        container: {
          position: [3, 5], size: [3, 5], background: 'maroon',
        },
        endpoint: hawkeyeEndpoint+"/text?type=uno",
        endpointMap: {"text": "src"},
        endpointMethod: 'POST',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 60 * 60 * 1000,
        },
        data: {
          note: '/text uno',
        }
      },
      "30e46823-3175-43a6-9a89-203eb763fe65": {
        type: 'text',
        container: {
          position: [0, 5], size: [3, 1], background: 'orange',
          fontSize: '5em',
        },
        endpoint: 'https://ai.uaprom/stats/uaprom',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 1 * 60 * 1000,
        },
        endpointPath: 'last_migration',
        endpointMap: {"target_title": "text"},
        data: { note: 'UA', }
      },
      "30e46823-3175-43a6-9a89-203eb763fe66": {
        type: 'text',
        container: {
          position: [0, 6], size: [3, 1], background: 'orange',
          fontSize: '5em',
        },
        endpoint: 'https://ai.uaprom/stats/ruprom',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 1 * 60 * 1000,
        },
        endpointPath: 'last_migration',
        endpointMap: {"target_title": "text"},
        data: { note: 'RU', }
      },
      "30e46823-3175-43a6-9a89-203eb763fe67": {
        type: 'text',
        container: {
          position: [0, 7], size: [3, 1], background: 'orange',
          fontSize: '5em',
        },
        endpoint: 'https://ai.uaprom/stats/byprom',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 1 * 60 * 1000,
        },
        endpointPath: 'last_migration',
        endpointMap: {"target_title": "text"},
        data: { note: 'BY', }
      },
      "30e46823-3175-43a6-9a89-203eb763fe68": {
        type: 'text',
        container: {
          position: [0, 8], size: [3, 1], background: 'orange',
          fontSize: '5em',
        },
        endpoint: 'https://ai.uaprom/stats/kzprom',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 1 * 60 * 1000,
        },
        endpointPath: 'last_migration',
        endpointMap: {"target_title": "text"},
        data: { note: 'KZ', }
      },
      "30e46823-3175-43a6-9a89-203eb763fe69": {
        type: 'text',
        container: {
          position: [0, 9], size: [3, 1], background: 'orange',
          fontSize: '5em',
        },
        endpoint: 'https://ai.uaprom/stats/mdprom',
        endpointSchedule: {
          type: ['timeInterval'],
          timeInterval: 1 * 60 * 1000,
        },
        endpointPath: 'last_migration',
        endpointMap: {"target_title": "text"},
        data: { note: 'MD', }
      },
    },
  }
}
