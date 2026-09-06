import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import { configs as airbnbConfigs, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import noUnsanitizedRules from '../rules/no-unsanitized.mjs';
import typescript from '../rules/typescript.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import { adaptAirbnbConfigs } from '../utils/airbnb.mjs';
// eslint-disable-next-line import-x/no-useless-path-segments -- native ESM needs the explicit index file
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';

const airbnb = [airbnbPlugins.importX, ...adaptAirbnbConfigs(airbnbConfigs.base.all)];

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
  /** @type {import('eslint').Linter.FlatConfig[]} */ (jQueryUnsafeMalSync.configs?.recommended),
  /** @type {import('eslint').Linter.FlatConfig[]} */ (
    ts.config(
      js.configs.recommended,
      airbnb,
      tsconfigs,
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
