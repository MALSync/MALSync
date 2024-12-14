import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import prettier from '../rules/prettier.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default merge(
  mergeAll(compat.extends('eslint-config-airbnb-base')),
  eslintPluginPrettierRecommended,
  preConfig(),
  core,
  importRules,
  prettier,
  postConfig(),
  /** @type {import('eslint').Linter.FlatConfig} */ ({
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  }),
);
