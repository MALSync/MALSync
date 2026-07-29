import js from '@eslint/js';
import esX from 'eslint-plugin-es-x';
// @ts-ignore
import cspellConfigs from '@cspell/eslint-plugin/configs';
import stylistic from '@stylistic/eslint-plugin';
import { merge } from './utils/merge.mjs';
import esXRules from './rules/esX.mjs';
import cspell from './rules/cspell.mjs';
import stylisticRules from './rules/stylistic.mjs';

/**
 * @returns {import('eslint').Linter.FlatConfig}
 */
export function preConfig() {
  return merge(
    js.configs.recommended,
    cspellConfigs.recommended,
    esX.configs['flat/restrict-to-es2021'],
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
          ecmaVersion: 2021,
        },
      },
    )
  );
}
