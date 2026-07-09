'use strict';

const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');
const PATHS = require('./paths');
const webpack = require('webpack');
const path = require('path');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    login: PATHS.src + '/login.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
  },
  watchOptions: {
    ignored: /node_modules\/(?!@bringweb3\/sdk)/,
  },
  resolve: {
    alias: {
      '@bringweb3/chrome-extension-kit': path.resolve(__dirname, '../../bringweb3-sdk/dist/index.js'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin([{
      template: PATHS.src + '/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    },
    {
      template: PATHS.src + '/login.html',
      filename: 'login.html',
      chunks: ['login']
    }]),
    new webpack.DefinePlugin({
      'process.env': {
        'PLATFORM_IDENTIFIER': JSON.stringify(process.env.PLATFORM_IDENTIFIER),
        'IFRAME_ENDPOINT': JSON.stringify(process.env.IFRAME_ENDPOINT)
      }
    })
  ]
});

module.exports = config;
