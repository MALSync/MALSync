import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueScopedCSS from 'eslint-plugin-vue-scoped-css';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import typescript from '../rules/typescript.mjs';
import vue from '../rules/vue.mjs';
import { compat } from '../utils/compat.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';

const airbnb = merge(compat.extends('airbnb-base', 'airbnb-typescript/base'));

delete airbnb.languageOptions?.parserOptions?.ecmaFeatures?.globalReturn;

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig[]} */ (
    jQueryUnsafeMalSync.configs?.recommended,
    ts.config(
      js.configs.recommended,
      airbnb,
      ...ts.configs.recommended,

      // Enable it after migrating all Vue components from Options API to Composition API
      // ...ts.configs.recommendedTypeChecked,

      ...eslintPluginVue.configs['flat/recommended'].map(config => {
        delete config.files;

        return config;
      }),
      ...eslintPluginVueScopedCSS.configs['flat/recommended'],
      merge(
        compat.extends('plugin:@cspell/recommended'),
        eslintPluginPrettierRecommended,
        preConfig(),
        core,
        importRules,
        typescript,
        vue,
        postConfig(),
        /** @type {import('eslint').Linter.FlatConfig} */ ({
          languageOptions: {
            globals: {
              ...globals.browser,
            },
            parserOptions: {
              parser: '@typescript-eslint/parser',
              sourceType: 'module',
              extraFileExtensions: ['.vue'],
            },
          },
        }),
      ),
    )
  ),
);
