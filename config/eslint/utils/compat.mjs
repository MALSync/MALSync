import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { mergeAll } from './mergeAllConfig.mjs';

const flatCompat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export const compat = {
  /**
   * @param  {Parameters<FlatCompat['extends']} configsToExtend
   */
  extends: (...configsToExtend) => mergeAll(flatCompat.extends(...configsToExtend)),
  /**
   * @param {Parameters<FlatCompat['config']>[0]} eslintrcConfig
   */
  config: eslintrcConfig => mergeAll(flatCompat.config(eslintrcConfig)),
  /**
   * @param  {Parameters<FlatCompat['plugins']} plugins
   */
  plugins: (...plugins) => mergeAll(flatCompat.plugins(...plugins)),
  /**
   * @param {Parameters<FlatCompat['env']>[0]} envConfig
   */
  env: envConfig => mergeAll(flatCompat.env(envConfig)),
};
