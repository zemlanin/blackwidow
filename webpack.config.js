var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var dependencies = require('./package.json').dependencies

require('dotenv').config({
  path: process.env.DOTENV || '.env.example'
})

var examples = fs.readdirSync(path.join(__dirname, '/dist/examples'))
  .map((name) => ({name, url: `/#/examples/${name}`}))

var plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      GITHUB_API_KEY: JSON.stringify(process.env.GITHUB_API_KEY),
      BWD_EXAMPLES: JSON.stringify(
        (process.env.BWD_EXAMPLES ? JSON.parse(process.env.BWD_EXAMPLES) : []).concat(examples)
      )
    }
  }),
  new webpack.optimize.CommonsChunkPlugin('core', 'js/core.js'),
  new ExtractTextPlugin('css/[name].css', {allChunks: true})
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({warnings: false}))
}

module.exports = {
  entry: {
    core: Object.keys(dependencies),
    cast: 'cast',
    main: 'main'
  },
  output: {
    path: 'dist/',
    publicPath: '',
    filename: 'js/[name].js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
      {test: /\.json$/, loader: 'json5-loader'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?-url' + (process.env.NODE_ENV === 'production' ? ',minimize' : '')
      )}
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'src/js',
      __dirname,
      'node_modules'
    ],
    extensions: ['.js', '.css', '']
  },
  plugins: plugins
}
