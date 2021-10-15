const webpack = require('webpack');
const path = require('path');
const appTarget = process.env.APP_TARGET || 'general';
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const packageJson = require('../package.json');

plugins = [
  new webpack.NormalModuleReplacementPlugin(/(.*)-general/, function(resource) {
    resource.request = resource.request.replace(/-general/, `-${appTarget}`);
  }),
  new webpack.ProvidePlugin({
    con: path.resolve(__dirname, './../src/utils/consoleBG'),
    utils: path.resolve(__dirname, './../src/utils/general'),
    api: path.resolve(__dirname, './../src/api/webextension'),
    j: path.resolve(__dirname, './../src/utils/j'),
  }),
  new webpack.DefinePlugin({
    env: JSON.stringify({
      CONTEXT: process.env.MODE === 'travis' ? 'production' : 'development',
    }),
  }),
]

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    new SentryWebpackPlugin({
      url: process.env.SENTRY_AUTH_URL,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'shark',
      project: 'malsync',
      release: `malsync@${packageJson.version}`,
      include: 'dist/webextension',
      ignore: ['node_modules', 'webpack.config.js'],
      setCommits: {
        auto: true,
      },
    }),
  );
}

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
  plugins: plugins,
};
