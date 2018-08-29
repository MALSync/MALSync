const path = require('path');
const webpack = require("webpack");
const wrapper = require('wrapper-webpack-plugin');
const package = require('../package.json');
const pageUrls = require('../src/pages/pageUrls');
const resourcesJson = require('./resources');

const generateMatchExcludes = () => {
  var match = [];
  var exclude = [];
  for (var key in pageUrls) {
    var el = pageUrls[key];
    if(typeof el.match !== "undefined") match = match.concat(el.match);
    if(typeof el.exclude !== "undefined") exclude = exclude.concat(el.exclude);
  }
  return {match: match, exclude: exclude}
}

const generateResources = () => {
  var resources = [];
  for (var key in resourcesJson) {
    var el = resourcesJson[key];
    resources.push(key+' '+el);
  }
  return resources;
}

const metadata = {
  'name': package['productName'],
  'namespace': 'https://greasyfork.org/users/92233',
  'description': package['description'],
  'version': package['version'],
  'author': package['author'],
  'grant': [
    'GM_xmlhttpRequest',
    'GM_getValue',
    'GM_setValue',
    'GM_addStyle',
    'GM.xmlHttpRequest',
    'GM.getValue',
    'GM.setValue'
  ],
  'match' : generateMatchExcludes().match,
  'exclude' : generateMatchExcludes().exclude,
  'resource' : generateResources(),
  'run-at': 'document_start',
  'connect': [
    'myanimelist.net',
    '*'
  ]
};

const generateMetadataBlock = (metadata) => {
  let block = '';
  for (let key in metadata) {
    if (metadata.hasOwnProperty(key)) {
      let values = metadata[key];
      if (values) {
        if (!Array.isArray(values)) {
          values = [values];
        }
        for (let i = 0; i < values.length; i++) {
          block += '// @' + key + ' ' + values[i] + '\n';
        }
      } else {
        block += '// @' + key + '\n';
      }
    }
  }

  return '// ==UserScript==\n'
    + block
    + '// ==/UserScript==\n\n';
};

module.exports = {
  entry: {
    index: path.join(__dirname, '..', 'src/index.ts')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [{ loader: 'to-string-loader' }, {loader: 'css-loader'}, {loader: 'less-loader'}]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.less' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '..', 'dist')
  },
  plugins: [
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      api: path.resolve(__dirname, './../src/api/userscript'),
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new wrapper({
      test: /\.js$/,
      header: generateMetadataBlock(metadata)
    })
  ],
  optimization: {
    minimize: false
  },
};
