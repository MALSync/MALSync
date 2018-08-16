const path = require('path');
const webpack = require("webpack");
const wrapper = require('wrapper-webpack-plugin');
const package = require('../package.json');
const pageUrls = require('../src/pages/pageUrls');

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
    'GM.xmlHttpRequest',
    'GM.getValue',
    'GM.setValue'
  ],
  'match' : generateMatchExcludes().match,
  'exclude' : generateMatchExcludes().exclude,
  'run-at': 'document_start',
  'connect': '*'
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
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
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
