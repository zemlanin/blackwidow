# blackwidow
dashboard. works better with [hawkeye](http://github.com/zemlanin/hawkeye) server

## demo
* https://blackwidow.surge.sh/
* https://blackwidow.surge.sh/?gist=00fd9405043a98c96a68
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/#https://blackwidow.surge.sh/examples/external_data.json

## example dashes
* src/js/mockDashes.json
* https://gist.github.com/zemlanin/00fd9405043a98c96a68
* https://blackwidow.surge.sh/examples/static_data.json
* https://blackwidow.surge.sh/examples/external_data.json

## setup
```bash
npm install
```

### deploy (via surge.sh)
```bash
make deploy
```

### dashboard api
Dashboard is 10×10 table and described by JSON object:

```json
{
    "widgets": {
        "bam": {
            "type": "text" // ...
        }
    }
}
```

* `{Object.<string, Object>}` **dashboard**: full dashboard. available keys: `widgets`
* `{Object.<string, Widget>}` **dashboard.widgets**: object with widgets. available keys: `"type"`, `"container"`, `"endpoint"`, `"data"`
    * `{string}` **Widget.type**: widget type. available values: `"text"`, `"image"`
    * `{Container}` **Widget.container**: widget container object. available keys: `"position"`, `"size"`, `"fontSize"`, `"debug"`

        ```
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

        * `{number[]}` **Container.size**: widget size in [x, y] format (see example above)
        * `{number[]}` **Container.position**: position of top left corner of a widget in [x, y] format (see example above)
        * `{string}` **Container.fontSize**: font size for text in widget. em values are recommended
        * `{string}` **Container.debug**: widget border color if config.debug is true
    * `{Endpoint}` **Widget.endpoint**: widget http(s) endpoint object
        * *TODO*
    * `{WidgetData}` **Widget.data**: widget displayed information. keys depend on Widget.type
        * *TODO*
