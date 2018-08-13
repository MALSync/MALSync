const path = require('path');
const webpack = require("webpack");

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
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  optimization: {
    minimize: false
  },
};
