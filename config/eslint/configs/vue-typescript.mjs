import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueScopedCSS from 'eslint-plugin-vue-scoped-css';
import { configs as airbnbConfigs, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import typescript from '../rules/typescript.mjs';
import vue from '../rules/vue.mjs';
import { compat } from '../utils/compat.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import { adaptAirbnbConfigs } from '../utils/airbnb.mjs';
// eslint-disable-next-line import-x/no-useless-path-segments -- native ESM needs the explicit index file
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';

// airbnb-extended's own `files` globs only cover .js/.ts, not .vue, so drop
// them and let the outer preset's `files: ['src/**/*.vue']` scope apply.
const airbnb = adaptAirbnbConfigs([airbnbPlugins.importX, ...airbnbConfigs.base.all], {
  stripFiles: true,
});

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig[]} */ (jQueryUnsafeMalSync.configs?.recommended),
  /** @type {import('eslint').Linter.FlatConfig[]} */ (
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
