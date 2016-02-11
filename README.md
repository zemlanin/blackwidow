# blackwidow [![Build Status](https://travis-ci.org/zemlanin/blackwidow.svg?branch=master)](https://travis-ci.org/zemlanin/blackwidow)
dashboard. works best with [quicksilver](http://github.com/zemlanin/quicksilver) server, but you can use any backend to supply data for widgets

## setup
```bash
npm install   # install dependencies
make          # recompile
make serve    # start a server at http://127.0.0.1:8000
make deploy   # deploy via surge.sh
```

## Demo
* https://blackwidow.surge.sh/
* https://blackwidow.surge.sh/?gist=00fd9405043a98c96a68
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/external_data.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/graphs.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/countdown.json

### Example dashboards
* https://blackwidow.surge.sh/examples/mockDashes.json
* https://gist.github.com/zemlanin/00fd9405043a98c96a68
* https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/examples/external_data.json
* https://blackwidow.surge.sh/examples/graphs.json
* https://blackwidow.surge.sh/examples/countdown.json

## Dashboard API
Dashboard is a table (10×10 by default) described by JSON object:

```json5
{
  "container": {
    "size": [16, 9]
  },
  "widgets": {
    "bam": {
      "type": "text" // ...
    }
  }
}
```

* `Object.<string, Object>` **dashboard**: full dashboard
* `DashContainer` **dashboard.container**: dashboard container object
    * `number[]` **DashContainer.size**: dashboard size in [x, y] format (`[10, 10]` by default)
* `Object.<string, Widget>` **dashboard.widgets**: object with widgets. keys are used to identify widgets
* `Widget` **dashboard.widgets[key]**: widget description
    * `string` **Widget.type**: widget type. available values: `"text"`, `"image"`
    * `Container` **Widget.container**: widget container object

        ```
          for default case dashboard.container.size = [10, 10]
               x →
         [0, 0]__1__2__3__4__5__6__7__8__9__[10, 0]
          y   |                             |
          ↓   1                             |
              |                             |
              2     ..........              |      `.` => {size: [3, 1], position [3, 2]}
              |     ..........              |
              3     ..........              |
              |                             |
              4                             |
              |                             |
              5#####################        |      `#` => {size: [7, 1], position [0, 5]}
              |#####################        |
              6#####################        |
              |                             |
              7                             |
              |                             |
              8xxxxxx                       |      `x` => {size: [2, 2], position [0, 8]}
              |xxxxxx                       |
              9xxxxxx                       |
              |xxxxxx                       |
        [0, 10]xxxxxx_______________________|
        ```

        * `number[]` **Container.size**: widget size in [x, y] format (see example above)
        * `number[]` **Container.position**: position of top left corner of a widget in [x, y] format (see example above)
        * `string` **Container.fontSize**: font size for text in widget. em values are recommended
    * `WidgetData` **Widget.data**: widget displayed information. keys depend on Widget.type
        * `string?` **WidgetData.note**: text if lower right corner of a widget. its fontSize is equal half of `Container.fontSize`
        * `string?` **WidgetData.text**: text for `Widget.type = "text"`
        * `string?` **WidgetData.src**: image url for `Widget.type = "image"`
        * `Object[]?|number[]?` **WidgetData.values**: values for `Widget.type = "graph"`
    * `Endpoint` **Widget.endpoint**: widget's HTTP(S) endpoint object
        * `string` **Endpoint.url**: url with WidgetData
        * `string?` **Endpoint.method**: HTTP method for WidgetData requests. `"GET"` by default
        * `Object?|string?` **Endpoint.body**: POST request body. If `body` is an Object, it is passed to `JSON.stringify` before sending a request
        * `Schedule?` **Endpoint.schedule**: schedule for updating WidgetData
            * `number?` **Schedule.timeInterval**: interval between requests in seconds
        * `Object.<WidgetData[key], PayloadFieldMapping>?` **Endpoint.map**: mapping of endpoint payload to widget data fields. keys are the names of WidgetData field (for example, `"note"`)
            * `Object|string` **PayloadFieldMapping**: mapping rules for a single WidgetData field. string-y PayloadFieldMapping's value is a shortcut for `{"_expr": value}`
                * `string` **PayloadFieldMapping._expr**: source of WidgetData field value. See [Endpoint Expressions](#endpoint-expressions) for more details
                * `*` **PayloadFieldMapping[key]**: base scope for endpoint expression
    * `Local` **Widget.local**: widget's local updates object. Useful for random (yet to be implemented) or date/time widgets. Analogous to `Endpoint` without HTTP(S) fields
        * `Schedule?` **Local.schedule**: schedule for updating WidgetData
            * `number?` **Schedule.timeInterval**: interval between requests in seconds
        * `Object.<WidgetData[key], PayloadFieldMapping>?` **Local.map**: mapping of endpoint payload to widget data fields. keys are the names of WidgetData field (for example, `"note"`)
            * `Object|string` **PayloadFieldMapping**: mapping rules for a single WidgetData field. string-y PayloadFieldMapping's value is a shortcut for `{"_expr": value}`
                * `string` **PayloadFieldMapping._expr**: source of WidgetData field value. See [Endpoint Expressions](#endpoint-expressions) for more details
                * `*` **PayloadFieldMapping[key]**: base scope for endpoint expression

### Endpoint Expressions
Endpoint Expressions are evaluated via [angular-expressions](https://github.com/peerigon/angular-expressions). Expression scope is an object, merged from the response value and the `PayloadFieldMapping` of the expression. Plus, full response value is available in `$` key of the scope

```js
"map": {
  "src": "text"
}

// is equivalent to

"map": {
  "src": {
    "_expr": "text"
  }
}

// is equivalent to

"map": {
  "src": "$.text"
}

// is equivalent to

"map": {
  "src": {
    "_expr": "$[_key]",
    "_key": "text"
  }
}
```

A few filters are available for manipulating response before rendering:
* `format:[template]` formats `template` with basic Python-like syntax

  ```js
  "map": {
    "src": "values | format:'http://example.com/{1}.{2}'"
  }

  // for response == {"values": ["how", "are", "you"]}, widget will receive data

  {
    "src": "http://example.com/are.you"
  }
  ```
* `match:[pattern]:[flags?]` matches expression with `pattern` via [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp). :warning: use *four backslashes for escaping*

  ```js
  "map": {
    "text": "text | match:'\\\\d{4}-(\\\\d{2})-(\\\\d{2})' | format:'{2}.{1}'"
  }

  // for response == {"text": "2015-09-13"}, widget will receive data

  {
    "text": "13.09"
  }
  ```
* `map:[mapping]` maps items of array expressions with passed mapping

  ```js
  "map": {
    "values": {
      "_expr": "text | match:'[a-z]+':'ig' | map:_map",
      "_map": {"value": "$"}
    }
  }

  // for response == {"text": "Mal|Zoe|Wash"}, widget will receive data

  {
    "values": [
      {"value": "Mal"},
      {"value": "Zoe"},
      {"value": "Wash"}
    ]
  }
  ```
* `get:[key]` for getting specific keys from already filtered expressions

  ```js
  "map": {
    "text": "text | match:'[a-z]+':'ig' | get:0"
  }

  // for response == {"text": "Mal|Zoe|Wash"}, widget will receive data

  {
    "text": "Mal"
  }
  ```
* `timeSince:[units?]` returns time interval since received date (parsed via `new Date()`) in units (`'days'` by default). Possible units: `'s'`, `'m'`, `'h'`, `'d'`, `'seconds'`, `'minutes'`, `'hours'`, `'days'`

  ```js
  "map": {
    "text": "0 | timeSince:'seconds'"
  }

  // widget will receive, for example

  {
    "text": 1455091752
  }
  ```
* `timeUntil:[units?]` returns time interval until received date (parsed via `new Date()`) in units (`'days'` by default). Possible units: `'s'`, `'m'`, `'h'`, `'d'`, `'seconds'`, `'minutes'`, `'hours'`, `'days'`

  ```js
  "map": {
    "text": "'2016-09-13' | timeUntil:'days'"
  }

  // widget will receive, for example

  {
    "text": 215
  }
  ```
