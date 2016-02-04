'use strict';

var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var dependencies = require("./package.json").dependencies;

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV) : '"development"'
  }),
  new webpack.optimize.CommonsChunkPlugin("core", "core.js"),
  new ExtractTextPlugin("[name].css", {allChunks: true}),
]

if (process.env.NODE_ENV === "production") {
  plugins.push(new webpack.optimize.UglifyJsPlugin({warnings: false}))
}

module.exports = {
  entry: {
    core: Object.keys(dependencies),
    cast: "cast",
    main: "main",
  },
  output: {
    path: 'dist/js/',
    publicPath: 'js/',
    filename: "[name].js",
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=react,presets[]=es2015'},
      {test: /\.json$/, loader: 'json5-loader'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
    ]
  },
  resolve: {
    modulesDirectories: [
      "node_modules",
      "src/js",
    ],
    extensions: ['.js', '']
  },
  plugins: plugins,
};