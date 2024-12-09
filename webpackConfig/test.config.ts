import { ProvidePlugin, DefinePlugin } from 'webpack';
import { join, resolve as _resolve } from 'path';
import { VueLoaderPlugin } from 'vue-loader';

export const entry = {
  index: join(__dirname, '..', 'test/index.ts'),
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
      },
    },
  ],
};
export const devtool = 'source-map';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js', '.less'],
  alias: {
    vue: '@vue/runtime-dom',
  },
};
export const mode = 'development';
export const output = {
  filename: 'testCode.js',
  path: _resolve(__dirname, '..', 'test', 'dist'),
};
export const plugins = [
  new VueLoaderPlugin(),
  new ProvidePlugin({
    con: _resolve(__dirname, './../src/utils/console'),
    utils: _resolve(__dirname, './../src/utils/general'),
    j: _resolve(__dirname, './../src/utils/j'),
    api: _resolve(__dirname, './../src/api/webextension'),
  }),
  new DefinePlugin({
    env: JSON.stringify({
      CONTEXT: process.env.MODE === 'travis' ? 'production' : 'development',
    }),
  }),
];
