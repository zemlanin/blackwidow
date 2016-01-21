# blackwidow
dashboard. works best with [quicksilver](http://github.com/zemlanin/quicksilver) server, but you can use any backend to supply data for widgets

## setup
```bash
npm install   # install dependencies
make          # recompile
make serve    # start a server at http://127.0.0.1:8000
make deploy   # deploy via surge.sh
```

## dashboard api
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
        * `string` **Container.debug**: widget border color if config.debug is true
    * `WidgetData` **Widget.data**: widget displayed information. keys depend on Widget.type
        * `string?` **WidgetData.note**: text if lower right corner of a widget. its fontSize is equal half of `Container.fontSize`
        * `string?` **WidgetData.text**: text for `Widget.type = "text"`
        * `string?` **WidgetData.src**: image url for `Widget.type = "image"`
        * `Object[]?|number[]?` **WidgetData.values**: values for `Widget.type = "graph"`
    * `Endpoint` **Widget.endpoint**: widget http(s) endpoint object
        * `string` **Endpoint.url**: url with WidgetData
        * `string?` **Endpoint.method**: HTTP method for WidgetData requests. `"GET"` by default
        * `Schedule` **Endpoint.schedule**: schudule for updating WidgetData
            * `string[]` **Schedule.type**: schedule types. availale values: `"timeInterval"`
            * `number?` **Schedule.timeInterval**: interval between requests in seconds
        * `Object.<WidgetData[key], PayloadFieldMapping>?` **Endpoint.map**: mapping of endpoint payload to widget data fields. keys are the names of WidgetData field (for example, `"note"`)
            * `Object|string` **PayloadFieldMapping**: mapping rules for a single WidgetData field. string-y PayloadFieldMapping's value is a shortcut for `{"_path": value}`
                * `string` **PayloadFieldMapping._path**: source of WidgetData field value
                * `string?` **PayloadFieldMapping._format**: base string for WidgetData field value. `{}` is replaced with data from `payload[PayloadFieldMapping._path]`
                * `PayloadFieldMapping?` **PayloadFieldMapping._map**: mapping for values of array WidgetData field
                * `bool?` **PayloadFieldMapping._parseInt**: should value be parsed as an integer

                ```json5
                {
                  "_path": "main.temp", // take payload.main.temp data
                  "_format": "{}°C"     // and insert it in a place of {}
                }
                ```

## demo
* https://blackwidow.surge.sh/
* https://blackwidow.surge.sh/?gist=00fd9405043a98c96a68
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/external_data.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/graphs.json

## example dashes
* https://blackwidow.surge.sh/examples/mockDashes.json
* https://gist.github.com/zemlanin/00fd9405043a98c96a68
* https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/examples/external_data.json
* https://blackwidow.surge.sh/examples/graphs.json
