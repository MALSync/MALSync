const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const pages = require('./utils/pages').pages();
const { getKeys } = require('./utils/keys');
const { getVirtualScript } = require('./utils/general');

let entry = {
  'content-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/content.ts',
  ),
  'mal-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/myanimelist.ts',
  ),
  'anilist-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/anilist.ts',
  ),
  'kitsu-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/kitsu.ts',
  ),
  'simkl-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/simkl.ts',
  ),
  'oauth-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/oauth.ts',
  ),
  'oauth-anilist-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/anilistOauth.ts',
  ),
  'oauth-shiki-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/shikiOauth.ts',
  ),
  'pwa-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/pwa.ts',
  ),
  iframe: path.join(__dirname, '..', 'src/iframe.ts'),
  popup: path.join(__dirname, '..', 'src/popup.ts'),
}

pages.forEach(page => {
  pageRoot = path.join(__dirname, '..', 'src/pages/', page);
  entry['page_' + page] = 'expose-loader?exposes=_Page|' + page + '!' + path.join(pageRoot, 'main.ts');
  if (fs.existsSync(path.join(pageRoot, 'proxy.ts'))) {
    entry['proxy/proxy_' + page] = getVirtualScript('proxy_' + page, `
      import { script } from './src/pages/${page}/proxy.ts';
      import { ScriptProxyWrapper } from './src/utils/scriptProxyWrapper.ts';

      ScriptProxyWrapper(script);
    `);
  }
})

console.log(entry);

module.exports = {
  entry: entry,
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
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.less', '.vue'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
  mode: 'development',
  output: {
    filename: 'content/[name].js',
    path: path.resolve(__dirname, '..', 'dist', 'webextension'),
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
      api: path.resolve(__dirname, './../src/api/webextension'),
    }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __MAL_SYNC_KEYS__: JSON.stringify(getKeys()),
    }),
  ],
};
