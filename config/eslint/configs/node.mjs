import globals from 'globals';
import { configs as airbnb, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { postConfig, preConfig } from '../base.mjs';
import core from '../rules/core.mjs';
import importRules from '../rules/importRules.mjs';
import prettier from '../rules/prettier.mjs';
import { merge } from '../utils/merge.mjs';
import { mergeAll } from '../utils/mergeAllConfig.mjs';
import { adaptAirbnbConfigs } from '../utils/airbnb.mjs';

export default merge(
  mergeAll(airbnbPlugins.importX, adaptAirbnbConfigs(airbnb.base.recommended)),
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
