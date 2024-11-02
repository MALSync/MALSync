import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';
import noUnsanitizedRules from '../rules/no-unsanitized.mjs';
import importRules from '../rules/importRules.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig<import('eslint').Linter.RulesRecord>[]} */ (
    jQueryUnsafeMalSync.configs?.recommended || []
  ),
  [
    merge(
      //
      mergeAll(compat.extends('eslint-config-airbnb-base')),
      preConfig(),
      eslintPluginPrettierRecommended,
      core,
      importRules,
      noUnsanitizedRules,
      postConfig(),
      {
        languageOptions: {
          globals: {
            ...globals.browser,
          },
        },
      },
    ),
  ],
);
