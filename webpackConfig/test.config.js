const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: {
    index: path.join(__dirname, '..', 'test/index.ts'),
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
        },
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.less'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
  mode: 'development',
  output: {
    filename: 'testCode.js',
    path: path.resolve(__dirname, '..', 'test', 'dist'),
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      j: path.resolve(__dirname, './../src/utils/j'),
      api: path.resolve(__dirname, './../src/api/webextension'),
    }),
    new webpack.DefinePlugin({
      env: JSON.stringify({
        CONTEXT: process.env.MODE === 'travis' ? 'production' : 'development',
      }),
    }),
  ],
};
