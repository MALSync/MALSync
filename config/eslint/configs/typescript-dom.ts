import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import noUnsanitizedRules from '../rules/no-unsanitized.mjs';
import typescript from '../rules/typescript.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';
import { compat } from '../utils/compat.mjs';

const airbnb = merge(compat.extends('airbnb-base', 'airbnb-typescript/base'));

delete airbnb.languageOptions?.parserOptions?.ecmaFeatures?.globalReturn;

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig[]} */ (jQueryUnsafeMalSync.configs?.recommended),
  /** @type {import('eslint').Linter.FlatConfig[]} */ (
    ts.config(
      js.configs.recommended,
      airbnb,
      ...ts.configs.recommended,
      ...ts.configs.recommendedTypeChecked,
      noUnsanitized.configs.recommended,
      merge(
        preConfig(),
        eslintPluginPrettierRecommended,
        core,
        importRules,
        typescript,
        noUnsanitizedRules,
        postConfig(),
        /** @type {import('eslint').Linter.FlatConfig} */ ({
          languageOptions: {
            globals: {
              ...globals.browser,
            },
            parserOptions: {
              sourceType: 'module',
            },
          },
        }),
      ),
    )
  ),
);
