import { merge } from './merge.mjs';

/**
 * @param  {import('eslint').Linter.FlatConfig[][]} configs
 */
export function mergeAll(...configs) {
  return configs
    .flat()
    .reduce(
      (acc, scope) => merge(acc, scope),
      /** @type {import('eslint').Linter.FlatConfig} */ ({}),
    );
}
