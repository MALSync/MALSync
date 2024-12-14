import { merge } from './utils/merge.mjs';

/** @satisfies {{ [scope: string]: () => Promise<{ default: import('eslint').Linter.FlatConfig }> }} */
const configMap = {
  async node() {
    return import('./configs/node.mjs');
  },
  async dom() {
    return import('./configs/dom.mjs');
  },
  async config() {
    return import('./configs/config.mjs');
  },
  async typescript() {
    return import('./configs/typescript.mjs');
  },
  'typescript-dom': async () => {
    return import('./configs/typescript-dom.mjs');
  },
  'vue-typescript': async () => {
    return import('./configs/vue-typescript.mjs');
  },
};

/**
 * @typedef {{
 *  preset: (keyof typeof configMap)[];
 *  config: import('eslint').Linter.FlatConfig;
 * }} Config
 */

/**
 * @param {Config} config
 * @returns {Promise<import('eslint').Linter.FlatConfig>}
 */
export async function useConfig(config) {
  const configs = config.preset
    .map(
      async scope => typeof configMap[scope] === 'function' && (await configMap[scope]()).default,
    )
    .filter(Boolean);
  const resolvedConfigs = await Promise.all(configs);

  const mergedConfig = merge(
    resolvedConfigs.reduce((acc, scope) => merge(acc, scope), {}),
    config.config,
  );

  if (!mergedConfig) {
    return Promise.reject(new Error('No config found'));
  }

  return mergedConfig;
}

export { merge } from './utils/merge.mjs';
export { mergeAll } from './utils/mergeAllConfig.mjs';
