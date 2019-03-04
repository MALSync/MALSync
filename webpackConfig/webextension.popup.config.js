const webpack = require("webpack");
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: {
    index: path.join(__dirname, '..', 'src/popup.ts')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [{ loader: 'to-string-loader' }, {loader: 'css-loader'}, {loader: 'less-loader'}]
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader'
      }
    ]
  },
  devtool: "source-map",
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.less', '.vue' ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  mode: 'development',
  output: {
    filename: 'popup.js',
    path: path.resolve(__dirname, '..', 'dist', 'webextension')
  },
  plugins: [
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      j: path.resolve(__dirname, './../src/utils/j'),
      api: path.resolve(__dirname, './../src/api/webextension'),
    }),
    new VueLoaderPlugin()
  ]
};
