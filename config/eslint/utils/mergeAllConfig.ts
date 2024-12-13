import { merge } from './merge';

/**
 * @param  {import('eslint').Linter.Config[][]} configs
 */
export function mergeAll(...configs: import('eslint').Linter.Config[][]) {
  return configs
    .flat()
    .reduce(
      (acc, scope) => merge(acc, scope),
      /** @type {import('eslint').Linter.Config} */ ({}),
    );
}
