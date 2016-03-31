var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var dependencies = require('package.json').dependencies
var config

if (process.env.NODE_ENV === 'production') {
  config = process.env.BWD_CONFIG
} else {
  config = process.env.BWD_CONFIG || 'config/example.js'
}

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
  new webpack.optimize.CommonsChunkPlugin('core', 'js/core.js'),
  new ExtractTextPlugin('css/[name].css', {allChunks: true}),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({warnings: false}))
}

module.exports = {
  entry: {
    core: Object.keys(dependencies),
    cast: 'cast',
    main: 'main',
  },
  output: {
    path: 'dist/',
    publicPath: '',
    filename: 'js/[name].js',
  },
  module: {
    preLoaders: [
      // {test: /\.js$/, exclude: /node_modules/, loader: 'standard'},
    ],
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
      {test: /\.json$/, loader: 'json5-loader'},
      {test: /config/, loader: 'callback?loadExamples'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?-url' + (process.env.NODE_ENV === 'production' ? ',minimize' : '')
      )},
    ],
  },
  resolve: {
    modulesDirectories: [
      'src',
      'src/js',
      __dirname,
      'node_modules',
    ],
    extensions: ['.js', '.css', ''],
    alias: {
      config: config,
    },
  },
  plugins: plugins,
  callbackLoader: {
    loadExamples: function () {
      return JSON.stringify(
        fs.readdirSync(path.join(__dirname, '/dist/examples'))
          .map(function (filename) {
            return {
              name: filename,
              url: '/#/examples/' + filename,
            }
          })
      )
    },
  },
}
