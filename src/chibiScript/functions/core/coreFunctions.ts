import { ChibiError } from '../../ChibiErrors';
import type { ChibiCtx } from '../../ChibiCtx';
import type { ChibiJson, ChibiParam } from '../../ChibiGenerator';
import { isReservedKey, type ReservedKey } from '../../ChibiRegistry';
import { ChibiReturn } from '../../ChibiReturn';
import domFunctions from '../domFunctions';
import asyncFunctions from './asyncFunctions';
import { localStore } from '../../../utils/localStore';

export default {
  /**
   * Gets the current URL or URL from context
   * @input void - No input required
   * @returns Current URL as string
   * @example
   * $c.url() // returns https://example.com/anime/123
   */
  url: (ctx: ChibiCtx, input: void): string => {
    const url = ctx.get('url');

    if (url && typeof url === 'string') {
      return url;
    }

    return typeof window !== 'undefined' ? window.location.href : '';
  },

  /**
   * Gets the current provider from context
   * @returns Current provider as string
   * @example
   * $c.provider() // returns 'MAL'
   */
  provider: (ctx: ChibiCtx, input: void): 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI' => {
    const provider = ctx.get('provider');

    if (!provider) {
      throw new ChibiError('Provider not set');
    }

    return provider;
  },

  /**
   * Gets the current target element from context
   * @returns Current target element
   * @example
   * $c.target()
   */
  target: (ctx: ChibiCtx, input: void): Element => {
    const target = ctx.get('element');

    if (!target) {
      throw new ChibiError('target element not set');
    }

    return target;
  },

  /**
   * Returns the input value immediately, stopping execution
   * @input any - Value to return
   * @returns The input value unchanged
   * @example
   * $c.string('/anime/123').ifThen($c => $c.urlAbsolute().return().run()).boolean(false)
   */
  return: (ctx: ChibiCtx, input: any): void => {
    return ctx.return(input) as unknown as void;
  },

  /**
   * Triggers lifecycle events
   * @input void - No input required
   */
  trigger: (ctx: ChibiCtx, input: void): void => {
    const trigger = ctx.get('trigger');

    if (!trigger) {
      throw new ChibiError('Trigger not set');
    }

    trigger();
  },

  /**
   * Calls a different function of the page implementation
   * @input any - Value to pass to the function
   * @param property - Function name to call
   * @returns The result of the function call
   * @example
   * $c.url().this('overview.getIdentifier') // Calls the getTitle function with the current URL as parameter
   */
  this: <Property extends string>(
    ctx: ChibiCtx,
    input: any,
    property: Property,
  ): Property extends `${string}.is${string}` | `is${string}`
    ? boolean
    : Property extends `${string}.elementsSelector` | 'elementsSelector'
      ? Element[]
      : Property extends
            | `${string}.getTitle`
            | 'getTitle'
            | `${string}.getIdentifier`
            | 'getIdentifier'
            | `${string}.getOverviewUrl`
            | 'getOverviewUrl'
            | `${string}.elementUrl`
            | 'elementUrl'
        ? string
        : Property extends `${string}.elementsSelector` | 'elementsSelector'
          ? Element[]
          : Property extends
                | `${string}.getEpisode`
                | 'getEpisode'
                | `${string}.getVolume`
                | 'getVolume'
            ? number
            : Property extends `${string}.nextEpUrl` | 'nextEpUrl'
              ? string | undefined | boolean
              : Property extends `${string}.getMalUrl` | 'getMalUrl'
                ? Promise<string | boolean> | string | boolean
                : any => {
    const page = ctx.get('pageObject');

    let propertyName: string = property;
    switch (property) {
      case 'sync.isSyncPage':
        propertyName = 'isSyncPage';
        break;
      case 'overview.isOverviewPage':
        propertyName = 'isOverviewPage';
        break;
      case 'sync.uiInjection':
        propertyName = 'sync.uiSelector';
        break;
      case 'overview.uiInjection':
        propertyName = 'overview.uiSelector';
        break;
      case 'list.elementsSelector':
        propertyName = 'overview.list.elementsSelector';
        break;
      case 'list.elementUrl':
        propertyName = 'overview.list.elementUrl';
        break;
      case 'list.elementEp':
        propertyName = 'overview.list.elementEp';
        break;
      default:
        break;
    }

    const propParts = propertyName.split('.');

    let value = page;
    // eslint-disable-next-line no-restricted-syntax
    for (const prop of propParts) {
      if (value[prop] === undefined) {
        throw new Error(`Property ${property} not found`);
      }
      value = value[prop];
    }

    if (typeof value === 'function') {
      return value(input);
    }
    return value;
  },

  /**
   * Gets a value from the variables in context
   * @input void - No input required
   * @param key - Variable name to retrieve
   * @param defaultValue - Default value if variable is not found
   * @returns Variable value or default value
   * @example
   * $c.getVariable<string>('myVar', 'default') // returns the value of myVar or 'default' if not set
   */
  getVariable: <Input = void, Output = any>(
    ctx: ChibiCtx,
    input: Input,
    key: ChibiParam<string>,
    defaultValue?: ChibiParam<Output>,
  ): Output => {
    const value = ctx.get(key);
    return value !== undefined ? value : (defaultValue as Output);
  },

  /**
   * Sets a variable in the context
   * @input any - Value to set if no value parameter is provided
   * @param key - Variable name to store the value under
   * @param value - Optional value to set instead of the input
   * @returns The input value (for chaining)
   * @example
   * $c.string('hello').setVariable('myKey') // sets myVar to 'hello'
   * $c.string('world').setVariable('myKey', $c.string('newValue').run()) // sets myVar to 'newValue'
   */
  setVariable: <Input>(
    ctx: ChibiCtx,
    input: Input,
    key: ChibiParam<Exclude<string, ReservedKey>>,
    value?: ChibiJson<any>,
  ): Input => {
    if (isReservedKey(key)) {
      throw new ChibiError(`Cannot set reserved key: ${key}`);
    }

    if (ctx.isAsync()) {
      return (async () => {
        if (value !== undefined) {
          const resolvedValue = await ctx.runAsync(value);
          ctx.set(key, resolvedValue);
        } else {
          ctx.set(key, input);
        }
        return input;
      })() as unknown as Input;
    }

    if (value !== undefined) {
      const resolvedValue = ctx.run(value);
      ctx.set(key, resolvedValue);
    } else {
      ctx.set(key, input);
    }
    return input;
  },

  /**
   * Gets a value from the global registry
   * @input void - No input required
   * @param key - Global variable name to retrieve
   * @param defaultValue - Default value if variable is not found
   * @returns Global variable value or default value
   * @example
   * $c.getGlobalVariable<string>('myGlobalVar', 'default') // returns the value of myGlobalVar or 'default' if not set
   */
  getGlobalVariable: <Input = void, Output = any>(
    ctx: ChibiCtx,
    input: Input,
    key: ChibiParam<string>,
    defaultValue?: ChibiParam<Output>,
  ): Output => {
    const value = ctx.globalGet(key);
    return value !== undefined ? value : (defaultValue as Output);
  },

  /**
   * Sets a variable in the global registry
   * @input any - Value to set if no value parameter is provided
   * @param key - Global variable name to store the value under
   * @param value - Optional value to set instead of the input
   * @returns The input value (for chaining)
   * @example
   * $c.string('hello').setGlobalVariable('myKey') // sets myVar to 'hello'
   * $c.string('world').setGlobalVariable('myKey', $c.string('newValue').run()) // sets myVar to 'newValue'
   */
  setGlobalVariable: <Input>(
    ctx: ChibiCtx,
    input: Input,
    key: ChibiParam<Exclude<string, ReservedKey>>,
    value?: ChibiJson<any>,
  ): Input => {
    if (isReservedKey(key)) {
      throw new ChibiError(`Cannot set reserved global key: ${key}`);
    }

    if (ctx.isAsync()) {
      return (async () => {
        if (value !== undefined) {
          const resolvedValue = await ctx.runAsync(value);
          ctx.globalSet(key, resolvedValue);
        } else {
          ctx.globalSet(key, input);
        }
        return input;
      })() as unknown as Input;
    }

    if (value !== undefined) {
      const resolvedValue = ctx.run(value);
      ctx.globalSet(key, resolvedValue);
    } else {
      ctx.globalSet(key, input);
    }
    return input;
  },

  /**
   * Creates a function scope.
   * Makes it possible to catch return values similar to a function
   * @input void - No input required
   * @param functionBody - Function body to execute
   * @returns The result of the function body
   * @example
   * $c
   *  .function($c.string('hello').return().run())
   *  .concat(' world')
   *  .log(); // 'hello world'
   */
  fn: <T = any>(ctx: ChibiCtx, input: void, functionBody: ChibiJson<T>): T => {
    if (ctx.isAsync()) {
      return (async () => {
        const result = await ctx.runAsync(functionBody);

        if (result && result instanceof ChibiReturn) {
          return result.getValue();
        }

        return result;
      })() as unknown as T;
    }

    const result = ctx.run(functionBody);

    if (result && result instanceof ChibiReturn) {
      return result.getValue();
    }

    return result;
  },

  /**
   * Adds a style to the page
   * @param css - CSS to add to the page
   * @example
   * $c.addStyle('body { background-color: red; }') // Adds a red background to the page
   */
  addStyle: (ctx: ChibiCtx, input: void, css: string): void => {
    api.storage.addStyle(css);
  },

  /**
   * Logs a value to the console
   * @input any - Value to log
   * @param prefix - Optional prefix for the log
   * @returns The input value (for chaining)
   * @example
   * $c.string('hello').log() // Logs 'hello' to the console
   */
  log: <Input>(ctx: ChibiCtx, input: Input, prefix: ChibiParam<string> = 'ChibiScript'): Input => {
    con.m(prefix).log(input);
    return input;
  },

  /**
   * Throws an error with custom message
   * @input any - Optional context for the error
   * @param message - Error message to throw
   * @returns Never returns, always throws
   */
  error: (ctx: ChibiCtx, input: any, message: ChibiParam<string>): never => {
    throw new ChibiError(message);
  },

  /**
   * Adds a CSS variable to the document root and updates it based on a callback.
   * Should be used inside of the setup lifecycle
   * @param name - Name of the CSS variable (e.g., --my-variable)
   * @param callback - Callback that returns the value of the CSS variable
   * @param defaultValue - Default value for the CSS variable
   * @example
   * $c.addCssVariable(
   *   '--malsync-card-bg',
   *   $c.querySelector('.card').getComputedStyle('background-color').run(),
   *   'blue'
   * )
   */
  addCssVariable(
    ctx: ChibiCtx,
    input: void,
    name: string,
    callback: ChibiJson<string>,
    defaultValue: string = '',
  ) {
    const storageKey = `mal-sync-css-var${name}`;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    asyncFunctions.domReady(ctx, undefined).then(() => {
      const savedValue = localStore.getItem(storageKey);
      if (savedValue || defaultValue) {
        styleSet(savedValue || defaultValue);
      }

      ctx.event.on('overview.uiSelector', runCallback);
      ctx.event.on('sync.uiSelector', runCallback);
    });

    function styleSet(value: string) {
      domFunctions.setStyle(ctx, document.documentElement, name, value, true);
    }
    async function runCallback() {
      let result;
      if (ctx.isAsync()) {
        result = await ctx.runAsync(callback);
      } else {
        result = ctx.run(callback);
      }

      if (result && result instanceof ChibiReturn) {
        result = result.getValue();
      }

      if (result && result !== localStore.getItem(storageKey)) {
        styleSet(result);
        localStore.setItem(storageKey, result);
      }
    }
  },
};
