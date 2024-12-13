import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import esX from 'eslint-plugin-es-x';
// @ts-expect-error
import cspellConfigs from '@cspell/eslint-plugin/configs';
import stylistic from '@stylistic/eslint-plugin';
import { merge } from './utils/merge';
import { mergeAll } from './utils/mergeAllConfig';
import esXRules from './rules/esX';
import cspell from './rules/cspell';
import stylisticRules from './rules/stylistic';

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
