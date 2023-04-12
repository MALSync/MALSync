const path = require('path');
const webpack = require('webpack');
const wrapper = require('./utils/WrapperPlugin');
const package = require('../package.json');
const pageUrls = require('../src/pages-adult/pageUrls');
const playerUrls = require('../src/pages-adult/playerUrls');
const resourcesJson = require('./resourcesUserscript');
const httpPermissionsJson = require('./httpPermissions.json');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const i18n = require('./utils/i18n');
const pagesUtils = require('./utils/pages');
const generateMatchExcludes = pagesUtils.generateMatchExcludes;

const generateResources = () => {
  const resources = [];
  for (const key in resourcesJson) {
    const el = resourcesJson[key];
    resources.push(`${key} ${el}`);
  }
  return resources;
};

const metadata = {
  name: `${package['productName']} Adult [FateXXXBlood Edition]`,
  namespace: 'https://greasyfork.org/users/92233',
  description: package['description'],
  version: '0.3.1',
  author: package['author'],
  license: 'GPL-3.0',
  iconURL: 'https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png',
  downloadURL: 'https://github.com/MALSync/MALSync/releases/latest/download/malsync-adult.user.js',
  updateURL: 'https://github.com/MALSync/MALSync/releases/latest/download/malsync-adult.user.js',
  grant: [
    'GM_xmlhttpRequest',
    'GM_getValue',
    'GM_setValue',
    'GM_deleteValue',
    'GM_listValues',
    'GM_addStyle',
    'GM_getResourceText',
    'GM_getResourceURL',
    'GM.xmlHttpRequest',
    'GM.getValue',
    'GM.setValue',
  ],
  match: generateMatchExcludes(pageUrls).match.concat(generateMatchExcludes(playerUrls).match),
  exclude: generateMatchExcludes(pageUrls).exclude,
  'require': 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js#sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=',
  resource: generateResources(),
  'run-at': 'document_start',
  connect: [
    ...httpPermissionsJson.map(url => url.replace(/(^https?:\/\/|\/+$|\*\.)/gi, '')),
    '*',
  ],
};

const generateMetadataBlock = metadata => {
  let block = '';
  for (const key in metadata) {
    if (metadata.hasOwnProperty(key)) {
      let values = metadata[key];
      if (values) {
        if (!Array.isArray(values)) {
          values = [values];
        }
        for (let i = 0; i < values.length; i++) {
          block += `// @${key} ${values[i]}\n`;
        }
      } else {
        block += `// @${key}\n`;
      }
    }
  }

  return `// ==UserScript==\n${block}// ==/UserScript==\n\n` + `var i18n = ${JSON.stringify(i18n())};\n`;
};

module.exports = {
  entry: {
    index: path.join(__dirname, '..', 'src/index-adult.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
        options: {
          customElement: true,
          shadowMode: true,
          exposeFilename: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.less', '.vue'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
  output: {
    filename: 'malsync-adult.user.js',
    path: path.resolve(__dirname, '..', 'dist'),
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, '../tsconfig.json'),
        extensions: {
          vue: {
            enabled: true,
            compiler: '@vue/compiler-sfc',
          },
        },
      },
    }),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      j: path.resolve(__dirname, './../src/utils/j'),
      api: path.resolve(__dirname, './../src/api/userscript'),
    }),
    new webpack.DefinePlugin({
      env: JSON.stringify({
        CONTEXT: process.env.MODE === 'travis' ? 'production' : 'development',
      }),
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new wrapper({
      test: /\.js$/,
      header: generateMetadataBlock(metadata),
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            beautify: true,
            comments: false,
          },
          mangle: false,
          compress: true,
        },
      }),
    ],
  },
};
