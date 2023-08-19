const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const Dotenv = require('dotenv-webpack');

const dev = {
  mode: 'development',
  stats: 'errors-warnings',
  devtool: 'eval',
  devServer: {
    open: false
  },
  plugins: [
    new Dotenv(),
  ]
}

module.exports = merge(common, dev)
