"use strict"

export var mockDashes = {
  0: {
    "widgets": {
      "duty": {
        "type": "text",
        "container": {
          "position": [0, 0],
          "size": [4, 2],
          "background": "green",
        },
        "endpoint": {
          "url": "https://blackwidow.parseapp.com/duty",
          "method": "POST",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 3600,
          },
        },
        "data": {
          "note": "/duty",
        }
      },
      "defaultVersion": {
        "type": "text",
        "container": {
          "position": [4, 0],
          "size": [4, 2],
          "background": "orange",
        },
        "endpoint": {
          "url": "https://blackwidow.parseapp.com/text?type=default",
          "method": "POST",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 600,
          },
        },
        "data": {
          "note": "/text default",
        }
      },
      "weather": {
        "type": "image",
        "container": {
          "position": [8, 0],
          "size": [2, 2],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "http://api.openweathermap.org/data/2.5/weather?q=Kiev&units=metric",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 600,
          },
          "map": {
            "src": {
              _format: "http://openweathermap.org/img/w/{}.png",
              _path: "weather.0.icon",
            },
            "note": {
              _format: "{}°C",
              _path: "main.temp",
            },
          },
        },
      },
      "quote": {
        "type": "text",
        "container": {
          "position": [0, 2],
          "size": [6, 3],
          "background": "orange",
        },
        "endpoint": {
          "url": "https://blackwidow.parseapp.com/text?type=quote",
          "method": "POST",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 1200,
          },
        },
        "data": {
          "note": "/text quote",
        }
      },
      "gif": {
        "type": "image",
        "container": {
          "position": [6, 2],
          "size": [4, 8],
          "background": "maroon",
        },
        "endpoint": {
          "url": "https://blackwidow.parseapp.com/text?type=gif",
          "method": "POST",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 900,
          },
          "map": {
            "src": "text",
          },
        },
        "data": {
          "note": "/text gif",
        }
      },
      "uno": {
        "type": "text",
        "container": {
          "position": [3, 5],
          "size": [3, 5],
          "background": "maroon",
          "fontSize": "10em",
        },
        "endpoint": {
          "url": "https://blackwidow.parseapp.com/text?type=uno",
          "method": "POST",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 1800,
          },
        },
        "data": {
          "note": "/text uno",
        }
      },
      "productionUA": {
        "type": "text",
        "container": {
          "position": [0, 5],
          "size": [3, 1],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "https://ai.uaprom/stats/uaprom",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 60,
          },
          "map": {
            "text": "last_migration.target_title",
          },
        },
        "data": {
          "note": "UA",
        }
      },
      "productionRU": {
        "type": "text",
        "container": {
          "position": [0, 6],
          "size": [3, 1],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "https://ai.uaprom/stats/ruprom",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 60,
          },
          "map": {
            "text": "last_migration.target_title",
          },
        },
        "data": {
          "note": "RU",
        }
      },
      "productionBY": {
        "type": "text",
        "container": {
          "position": [0, 7],
          "size": [3, 1],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "https://ai.uaprom/stats/byprom",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 60,
          },
          "map": {
            "text": "last_migration.target_title",
          },
        },
        "data": {
          "note": "BY",
        }
      },
      "productionKZ": {
        "type": "text",
        "container": {
          "position": [0, 8],
          "size": [3, 1],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "https://ai.uaprom/stats/kzprom",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 60,
          },
          "map": {
            "text": "last_migration.target_title",
          },
        },
        "data": {
          "note": "KZ",
        }
      },
      "productionMD": {
        "type": "text",
        "container": {
          "position": [0, 9],
          "size": [3, 1],
          "background": "orange",
          "fontSize": "5em",
        },
        "endpoint": {
          "url": "https://ai.uaprom/stats/mdprom",
          "schedule": {
            "type": ["timeInterval"],
            "timeInterval": 60,
          },
          "map": {
            "text": "last_migration.target_title",
          },
        },
        "data": {
          "note": "MD",
        }
      },
    },
  }
}
