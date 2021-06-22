const webpack = require('webpack');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const pages = require('./utils/pages').pages();

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
  'pwa-script': path.join(
    __dirname,
    '..',
    'src/index-webextension/pwa.ts',
  ),
  iframe: path.join(__dirname, '..', 'src/iframe.ts'),
  popup: path.join(__dirname, '..', 'src/popup.ts'),
  install: path.join(__dirname, '..', 'src/index-webextension/install.ts'),
  'update-check': path.join(__dirname, '..', 'src/updateCheck.ts'),
}

pages.forEach(page => {
  entry['page_' + page] =
    'expose-loader?exposes[]=_Page|' + page + '!' + path.join(__dirname, '..', 'src/pages/', page, 'main.ts');
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
        use: [
          'vue-style-loader',
          { loader: 'to-string-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
        options: {
          shadowMode: true,
        },
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.less', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  mode: 'development',
  output: {
    filename: 'content/[name].js',
    path: path.resolve(__dirname, '..', 'dist', 'webextension'),
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      j: path.resolve(__dirname, './../src/utils/j'),
      api: path.resolve(__dirname, './../src/api/webextension'),
    }),
  ],
};
