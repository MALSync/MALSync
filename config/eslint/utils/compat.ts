import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { mergeAll } from './mergeAllConfig.js';

const flatCompat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export const compat = {
  /**
   * @param  {Parameters<FlatCompat['extends']} configsToExtend
   */
  extends: (...configsToExtend: Parameters<FlatCompat['extends']>) => mergeAll(flatCompat.extends(...configsToExtend)),
  /**
   * @param {Parameters<FlatCompat['config']>[0]} eslintrcConfig
   */
  config: (eslintrcConfig: Parameters<FlatCompat['config']>[0]) => mergeAll(flatCompat.config(eslintrcConfig)),
  /**
   * @param  {Parameters<FlatCompat['plugins']} plugins
   */
  plugins: (...plugins: Parameters<FlatCompat['plugins']>) => mergeAll(flatCompat.plugins(...plugins)),
  /**
   * @param {Parameters<FlatCompat['env']>[0]} envConfig
   */
  env: (envConfig: Parameters<FlatCompat['env']>[0]) => mergeAll(flatCompat.env(envConfig)),
};
