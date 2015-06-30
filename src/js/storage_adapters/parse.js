'use strict'

export const CLOUD_CODE = 'CLOUD_CODE'

export function getParseUrl(type, params) {
  switch (type) {
    case CLOUD_CODE:
      return "https://api.parse.com/1/functions/"+params.name
  }
}
