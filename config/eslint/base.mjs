import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import esX from 'eslint-plugin-es-x';
// @ts-ignore
import cspellConfigs from '@cspell/eslint-plugin/configs';
import stylistic from '@stylistic/eslint-plugin';
import { merge } from './utils/merge.mjs';
import { mergeAll } from './utils/mergeAllConfig.mjs';
import esXRules from './rules/esX.mjs';
import cspell from './rules/cspell.mjs';
import stylisticRules from './rules/stylistic.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * @param {string[]} plugins
 * @returns {import('eslint').Linter.FlatConfig}
 */
export function preConfig(plugins = []) {
  return merge(
    js.configs.recommended,
    mergeAll(compat.plugins('import', ...plugins)),
    cspellConfigs.recommended,
    esX.configs['flat/restrict-to-es2018'],
    stylistic.configs['recommended-flat'],
  );
}

/**
 * @returns {import('eslint').Linter.FlatConfig}
 */
export function postConfig() {
  return /** @type {import('eslint').Linter.FlatConfig} */ (
    merge(
      //
      esXRules,
      cspell,
      stylisticRules,
      {
        languageOptions: {
          ecmaVersion: 2018,
        },
      },
    )
  );
}
