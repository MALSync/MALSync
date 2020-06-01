const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    index: path.join(__dirname, '..', 'src/background.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'development',
  output: {
    filename: 'background.js',
    path: path.resolve(__dirname, '..', 'dist', 'webextension'),
  },
  plugins: [
    new webpack.ProvidePlugin({
      con: path.resolve(__dirname, './../src/utils/consoleBG'),
      utils: path.resolve(__dirname, './../src/utils/general'),
      api: path.resolve(__dirname, './../src/api/webextension'),
      j: path.resolve(__dirname, './../src/utils/j'),
    }),
  ],
};
