import { merge as tsMerge } from 'ts-deepmerge';

/**
 * @template {NonNullable<unknown>[]} T
 * @param  {T} args
 * @returns {T[number]}
 */
export function merge<T>(...args: T): T[number] {
  return /** @type {T} */ (
    /** @type {unknown} */ (tsMerge.withOptions({ mergeArrays: false }, ...args))
  );
}
