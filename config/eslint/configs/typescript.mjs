import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import typescript from '../rules/typescript.mjs';
import { compat } from '../utils/compat.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import { merge } from '../utils/merge.mjs';
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';

const airbnb = merge(compat.extends('airbnb-base', 'airbnb-typescript/base'));

delete airbnb.languageOptions?.parserOptions?.ecmaFeatures?.globalReturn;

const seen = new Set();
const tsconfigs = [...ts.configs.recommended, ...ts.configs.recommendedTypeChecked].filter(
  config => {
    if (config.name && seen.has(config.name)) {
      return false;
    }
    if (config.name) {
      seen.add(config.name);
    }
    return true;
  },
);

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig[]} */ (
    jQueryUnsafeMalSync.configs?.recommended,
    ts.config(
      js.configs.recommended,
      airbnb,
      tsconfigs,
      merge(
        preConfig(),
        eslintPluginPrettierRecommended,
        core,
        importRules,
        typescript,
        postConfig(),
        /** @type {import('eslint').Linter.FlatConfig} */ ({
          languageOptions: {
            globals: {
              ...globals.node,
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
