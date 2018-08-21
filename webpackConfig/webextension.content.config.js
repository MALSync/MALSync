const webpack = require("webpack");
const path = require('path');

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
  devtool: "cheap-source-map",
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.less' ]
  },
  mode: 'development',
  output: {
    filename: 'content-script.js',
    path: path.resolve(__dirname, '..', 'dist', 'webextension')
  },
  plugins: [
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/console'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      api: path.resolve(__dirname, './../src/api/webextension'),
    }),
  ],
  optimization: {
    minimize: false
  }
};
