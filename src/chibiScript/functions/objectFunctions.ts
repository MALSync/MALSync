import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Gets a property from an object by key
   * @input object - Object to get property from
   * @param key - Key to access the property
   * @returns Value at the specified key or undefined if not found
   * @example
   * $c.object({user: {name: "John"}}).get("user") // returns {name: "John"}
   */
  get: (ctx: ChibiCtx, input: any, key: ChibiParam<string>) => {
    if (!input || typeof input !== 'object') {
      return undefined;
    }

    return input[key];
  },

  /**
   * Gets all keys from an object
   * @input object - Object to get keys from
   * @returns Array of key strings
   * @example
   * $c.object({name: "John", age: 30}).keys() // returns ["name", "age"]
   */
  keys: (ctx: ChibiCtx, input: any) => {
    if (!input || typeof input !== 'object') {
      return [];
    }

    return Object.keys(input);
  },

  /**
   * Gets all values from an object
   * @input object - Object to get values from
   * @returns Array of values
   * @example
   * $c.object({name: "John", age: 30}).values() // returns ["John", 30]
   */
  values: (ctx: ChibiCtx, input: any) => {
    if (!input || typeof input !== 'object') {
      return [];
    }

    return Object.values(input);
  },

  /**
   * Return a value of first match of a specific object's key
   * @input object - Object to get property from
   * @param key - Property to look for
   * @param type - Optional. Breadth-First Search (BFS) or Depth-First Search (DFS). Default is DFS
   * @returns value of the found key, or undefined if not found
   * @example
   * $c.string('{"user":{"profile":{"name":"John"}}}').jsonParse().search('name').run() // returns "John"
   */
  search(ctx: ChibiCtx, input: any, key: string, type?: 'dfs' | 'bfs'): any {
    const mode = type || 'dfs';
    const execute = (data: any, queue: any[] = []): any => {
      // DFS Search
      if (mode === 'dfs') {
        if (!data || typeof data !== 'object') return undefined;
        if (Object.prototype.hasOwnProperty.call(data, key)) return data[key];

        return Object.values(data).reduce(
          (found, val) => (found !== undefined ? found : execute(val)),
          undefined,
        );
      }
      // BFS Search
      const currentLevel = queue.length === 0 ? [data] : queue;
      const match = currentLevel.find(
        node => node && typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, key),
      );
      if (match) return match[key];

      const nextLevel = currentLevel
        .flatMap(node => (node && typeof node === 'object' ? Object.values(node) : []))
        .filter(val => val && typeof val === 'object');

      return nextLevel.length > 0 ? execute(null, nextLevel) : undefined;
    };

    return execute(input);
  },
};
