import { NormalModuleReplacementPlugin, ProvidePlugin, DefinePlugin } from 'webpack';
import { resolve as _resolve, join } from 'path';
const appTarget = process.env.APP_TARGET || 'general';
import SentryWebpackPlugin from '@sentry/webpack-plugin';
import { version } from '../package.json';

plugins = [
  new NormalModuleReplacementPlugin(/(.*)-general/, function(resource) {
    resource.request = resource.request.replace(/-general/, `-${appTarget}`);
  }),
  new ProvidePlugin({
    con: _resolve(__dirname, './../src/utils/consoleBG'),
    utils: _resolve(__dirname, './../src/utils/general'),
    api: _resolve(__dirname, './../src/api/webextension'),
    j: _resolve(__dirname, './../src/utils/j'),
  }),
  new DefinePlugin({
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
      release: `malsync@${version}`,
      include: 'dist/webextension',
      ignore: ['node_modules', 'webpack.config.js'],
      setCommits: {
        auto: true,
      },
    }),
  );
}

export const entry = {
  index: join(__dirname, '..', 'src/background.ts'),
};
export const module = {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
};
export const devtool = 'source-map';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js'],
};
export const mode = 'development';
export const output = {
  filename: 'background.js',
  path: _resolve(__dirname, '..', 'dist', 'webextension'),
};
export const plugins = plugins;
