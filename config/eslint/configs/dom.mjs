import globals from 'globals';
import { configs as airbnb, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
// eslint-disable-next-line import-x/no-useless-path-segments -- native ESM needs the explicit index file
import jQueryUnsafeMalSync from '../plugins/jquery-unsafe-malsync/index.mjs';
import noUnsanitizedRules from '../rules/no-unsanitized.mjs';
import importRules from '../rules/importRules.mjs';
import { adaptAirbnbConfigs } from '../utils/airbnb.mjs';

export default mergeAll(
  /** @type {import('eslint').Linter.FlatConfig<import('eslint').Linter.RulesRecord>[]} */ (
    jQueryUnsafeMalSync.configs?.recommended || []
  ),
  [
    merge(
      //
      mergeAll(airbnbPlugins.importX, adaptAirbnbConfigs(airbnb.base.recommended)),
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
