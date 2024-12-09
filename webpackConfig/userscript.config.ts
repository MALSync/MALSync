import { join, resolve as _resolve } from 'path';
import { ProvidePlugin, DefinePlugin, optimize } from 'webpack';
import wrapper from './utils/WrapperPlugin';
import package from '../package.json';
import generalUrls from './utils/pageUrls';
const pages = require('./utils/pages').pagesUrls();
import playerUrls from '../src/pages/playerUrls';
import resourcesJson from './resourcesUserscript';
import { map } from './httpPermissions.json';
import { VueLoaderPlugin } from 'vue-loader';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import i18n from './utils/i18n';
import { generateMatchExcludes as _generateMatchExcludes } from './utils/pages';
const generateMatchExcludes = _generateMatchExcludes;

const pageUrls = { ...generalUrls, ...pages };

const generateResources = () => {
  const resources = [];
  for (const key in resourcesJson) {
    const el = resourcesJson[key];
    resources.push(`${key} ${el}`);
  }
  return resources;
};

const metadata = {
  name: package['productName'],
  namespace: 'https://greasyfork.org/users/92233',
  description: package['description'],
  version: package['version'],
  author: package['author'],
  license: 'GPL-3.0',
  iconURL: 'https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png',
  downloadURL: 'https://github.com/MALSync/MALSync/releases/latest/download/malsync.user.js',
  updateURL: 'https://github.com/MALSync/MALSync/releases/latest/download/malsync.user.js',
  grant: [
    'GM_xmlhttpRequest',
    'GM_getValue',
    'GM_setValue',
    'GM_deleteValue',
    'GM_listValues',
    'GM_addStyle',
    'GM_getResourceText',
    'GM_getResourceURL',
    'GM_notification',
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
    ...map(url => url.replace(/(^https?:\/\/|\/+$|\*\.)/gi, '')),
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

export const entry = {
  index: join(__dirname, '..', 'src/index.ts'),
};
export const module = {
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
};
export const resolve = {
  extensions: ['.tsx', '.ts', '.js', '.less', '.vue'],
  alias: {
    vue: '@vue/runtime-dom',
  },
};
export const output = {
  filename: 'malsync.user.js',
  path: _resolve(__dirname, '..', 'dist'),
};
export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      configFile: _resolve(__dirname, '../tsconfig.json'),
      extensions: {
        vue: {
          enabled: true,
          compiler: '@vue/compiler-sfc',
        },
      },
    },
  }),
  new VueLoaderPlugin(),
  new ProvidePlugin({
    con: _resolve(__dirname, './../src/utils/console'),
    utils: _resolve(__dirname, './../src/utils/general'),
    j: _resolve(__dirname, './../src/utils/j'),
    api: _resolve(__dirname, './../src/api/userscript'),
  }),
  new DefinePlugin({
    env: JSON.stringify({
      CONTEXT: process.env.MODE === 'travis' ? 'production' : 'development',
    }),
  }),
  new optimize.LimitChunkCountPlugin({
    maxChunks: 1,
  }),
  new wrapper({
    test: /\.js$/,
    header: generateMetadataBlock(metadata),
  }),
];
export const optimization = {
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
};
