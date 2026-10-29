/*
 * Browser runtime for chibi development.
 * Exposes window.ChibiDev to execute compiled chibi pages and ChibiJson snippets on the current page.
 * Page data is not bundled. The chibi dev extension (test/chibiDev/extension) provides the current build,
 * or it is set with ChibiDev.setPages().
 * Expects jQuery and test/headless/chromeStub.js to be loaded first, same as testCode.js.
 */
import { doesUrlMatchPatterns } from 'webext-patterns';
import { xhrAction } from '../../src/background/messageHandler';
import { Chibi } from '../../src/pages-chibi/ChibiProxy';
import { ChibiConsumer } from '../../src/chibiScript/ChibiConsumer';
import { $c } from '../../src/chibiScript/ChibiGenerator';
import { RULE_SETS } from '../../src/_provider/Search/rulesClass';
import type { ChibiGenerator, ChibiJson } from '../../src/chibiScript/ChibiGenerator';
import type { pageInterface } from '../../src/pages/pageInterface';
import type {
  PageJsonInterface,
  PageListJsonInterface,
} from '../../src/pages-chibi/pageInterface';

type ChibiDevData = {
  list: PageListJsonInterface;
  pages: { [key: string]: PageJsonInterface };
};

type ChibiDevError = {
  name: string;
  functionName?: string;
  message: string;
  input?: unknown;
  args?: unknown;
};

const UI_TEST_HTML = '<div><div id="MAL-SYNC-TEST">TEST-UI</div></div>';

let data: ChibiDevData = { list: { pages: {} } as PageListJsonInterface, pages: {} };
let errors: ChibiDevError[] = [];
let pagePromise: Promise<pageInterface> | null = null;
// Errors already reported on a runPage field
const capturedErrors = new Set<ChibiDevError>();
let resolveReady: () => void;
const dataReady = new Promise<void>(resolve => {
  resolveReady = resolve;
});

function errorMessage(error: any) {
  return error && error.message ? error.message : String(error);
}

function describeElement(el: Element) {
  let text = `${el.tagName.toLowerCase()}`;
  if (el.id) text += `#${el.id}`;
  if (el.classList && el.classList.length) text += `.${Array.from(el.classList).join('.')}`;
  const content = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (content) text += ` "${content.length > 60 ? `${content.slice(0, 60)}…` : content}"`;
  return `<${text}>`;
}

// Makes values JSON safe. Elements are shortened to <tag#id.class "text">
function describe(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return '[function]';
  if (typeof value !== 'object') return value;
  if (value instanceof Element) return describeElement(value);
  if (value instanceof Date) return value.toISOString();
  if (depth > 4) return '[…]';
  if (value instanceof j.$) return describe((value as any).toArray(), depth);
  if (Array.isArray(value) || value instanceof NodeList || value instanceof HTMLCollection) {
    const arr = Array.from(value as ArrayLike<unknown>);
    const items = arr.slice(0, 50).map(v => describe(v, depth + 1));
    if (arr.length > 50) items.push(`[… ${arr.length - 50} more]`);
    return items;
  }
  const result = {};
  Object.keys(value as object).forEach(key => {
    result[key] = describe(value[key], depth + 1);
  });
  return result;
}

// Collect chibi runtime errors instead of only logging them
const originalLogError = ChibiConsumer.prototype.logError;
ChibiConsumer.prototype.logError = function logError(error, functionName, input, args) {
  errors.push({
    name: (this as any).name,
    functionName,
    message: errorMessage(error),
    input: describe(input),
    args: describe(args),
  });
  return originalLogError.call(this, error, functionName, input, args);
};

// Serve chibi repository requests from ChibiDev data, like test/index.ts does with the bundled pages
// @ts-ignore
window.chrome.runtime.sendMessage = (message: any, callback: (response: any) => void) => {
  if (message.name !== 'xhr') return;
  const url: string = (typeof message.url === 'object' ? message.url.url : message.url).split('?')[0];

  // The stubbed chrome.runtime.getURL('chibi') returns '', so the local repository requests /list.json
  const isLocal = url === '/list.json' || /^\/pages\/[^/]+\.json$/.test(url);
  if (isLocal || url.startsWith('https://chibi.malsync.moe/')) {
    let response: unknown = null;
    if (url.endsWith('/list.json')) {
      // Remote lists are empty so the local build always wins
      response = isLocal ? data.list : { pages: {} };
    } else {
      response = data.pages[url.split('/').pop()!.replace(/\.json$/, '')];
    }
    callback({ responseText: JSON.stringify(response), status: response ? 200 : 404, finalUrl: url });
    return;
  }

  xhrAction(message, 'chibiDev', callback, 'content');
};

function timeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

function getPage() {
  if (!pagePromise) {
    pagePromise = Chibi();
    pagePromise.catch(() => {
      pagePromise = null;
    });
  }
  return pagePromise;
}

function matchingKeys(url = window.location.href) {
  return Object.keys(data.list.pages).filter(key => {
    const { match } = data.list.pages[key].urls;
    return match && match.length && doesUrlMatchPatterns(url, ...match);
  });
}

type Captured = { value: any; errors?: ChibiDevError[] };

async function capture(name: string, fn: () => unknown): Promise<Captured> {
  const before = errors.length;
  try {
    let value = fn();
    if (value instanceof Promise) value = await timeout(value, 10000, '[timeout]');
    const fieldErrors = errors.slice(before);
    fieldErrors.forEach(error => capturedErrors.add(error));
    return fieldErrors.length
      ? { value: describe(value), errors: fieldErrors }
      : { value: describe(value) };
  } catch (error) {
    return { value: null, errors: [{ name, message: errorMessage(error) }] };
  }
}

// Same check as the test runner: inject a marker and see if it lands in the page
function uiCheck(inject: (html: string) => void) {
  inject(UI_TEST_HTML);
  const el = document.querySelector('#MAL-SYNC-TEST');
  if (!el) return { text: null, injectedNextTo: null };
  const wrapper = el.parentElement!;
  const anchor = wrapper.previousElementSibling || wrapper.parentElement;
  const result = { text: el.textContent, injectedNextTo: anchor ? describeElement(anchor) : null };
  wrapper.remove();
  return result;
}

// Same filtering as the test runner and syncPage, NaN is no season
function addSeasonExpected(v: { [key: string]: Captured }, expected: any) {
  if (v.season) {
    const season = parseInt(`${v.season.value}`);
    if (!Number.isNaN(season)) expected.season = season;
  }
  if (v.ruleSet && RULE_SETS.includes(v.ruleSet.value)) expected.ruleSet = v.ruleSet.value;
}

// Bot checks that need a human in the visible browser
function detectChallenge(): string | null {
  if (
    (window as any)._cf_chl_opt ||
    document.querySelector('#challenge-form, #challenge-running, #cf-challenge-running')
  ) {
    return 'cloudflare';
  }
  const turnstile = document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
  if (turnstile && !turnstile.value) return 'turnstile';
  return null;
}

type ChibiInput = ChibiJson<any> | ChibiGenerator<any> | (($c: ChibiGenerator<unknown>) => any);

// Accepts compiled json, an unfinished chain or a function returning either
function toChibiJson(input: ChibiInput): ChibiJson<any> {
  let script: any = input;
  if (typeof script === 'function') script = script($c);
  if (script && !Array.isArray(script) && typeof script.run === 'function') script = script.run();
  if (!Array.isArray(script)) throw new Error('exec() expects ChibiJson, a $c chain or ($c) => chain');
  return script;
}

const ChibiDev = {
  /**
   * The ChibiScript builder, same as in page implementations
   */
  $c,

  /**
   * Resolves as soon as the page data is loaded
   */
  ready: dataReady,

  /**
   * Provide compiled pages. Format: { list: list.json, pages: { [key]: pages/<key>.json } }
   */
  setPages(newData: ChibiDevData) {
    data = newData;
    pagePromise = null;
    resolveReady();
  },

  /**
   * 'cloudflare' or 'turnstile' when the page shows a bot check a human has to solve, otherwise null
   */
  challenge: detectChallenge,

  /**
   * Keys of the loaded pages and which of them match the current url
   */
  pages() {
    return { loaded: Object.keys(data.pages), matching: matchingKeys() };
  },

  /**
   * Execute ChibiScript on the current page: compiled json, a $c chain or ($c) => chain.
   * `url` is the current location, `this()` calls resolve against the matching page if there is one.
   */
  async exec(input: ChibiInput, options: { timeout?: number } = {}) {
    await timeout(dataReady, 5000, undefined);
    errors = [];
    let script: ChibiJson<any>;
    try {
      script = toChibiJson(input);
    } catch (error) {
      return { value: null, errors: [{ name: 'exec', message: errorMessage(error) }], ms: 0 };
    }
    const consumer = new ChibiConsumer(script, 'exec');
    consumer.addVariable('url', window.location.href);
    if (matchingKeys().length) {
      const page = await getPage().catch(() => undefined);
      if (page) consumer.addVariable('pageObject', page);
    }

    const start = Date.now();
    try {
      const value = await timeout(
        consumer.runAsync() as Promise<unknown>,
        options.timeout || 15000,
        '[timeout]',
      );
      const challenge = detectChallenge();
      return { value: describe(value), errors, ms: Date.now() - start, ...(challenge ? { challenge } : {}) };
    } catch (error) {
      errors.push({ name: 'exec', message: errorMessage(error) });
      return { value: null, errors, ms: Date.now() - start };
    } finally {
      consumer.clearIntervals();
    }
  },

  /**
   * Run the matching page like the extension does and report every value it produces.
   * `expected` has the format of a tests.json testCase.
   */
  async runPage(options: { timeout?: number } = {}) {
    await timeout(dataReady, 5000, undefined);
    errors = [];
    const url = window.location.href;
    const keys = matchingKeys(url);
    const report: any = { url, key: keys[0] || null, ready: false, type: 'none', values: {} };
    const challenge = detectChallenge();
    if (challenge) {
      report.challenge = challenge;
      report.warning = 'The page shows a bot check. Ask the user to solve it in the browser, then reload and retry.';
    }

    if (!keys.length) {
      report.errors = [
        {
          name: 'runPage',
          message: `No loaded page matches ${url}. Loaded: ${Object.keys(data.pages).join(', ')}`,
        },
      ];
      return report;
    }
    if (keys.length > 1) report.warning = `Multiple pages match this url: ${keys.join(', ')}`;

    let page: pageInterface;
    try {
      page = await getPage();
    } catch (error) {
      report.errors = [{ name: 'Chibi()', message: errorMessage(error) }];
      return report;
    }
    report.name = page.name;

    const readyState = new Promise<boolean | string>(resolve => {
      page.init({
        url,
        reset() {},
        handlePage() {
          resolve(true);
        },
        handleList() {},
        cdn(type) {
          resolve(`cdn:${type}`);
        },
      } as any);
    });
    report.ready = await timeout(readyState, options.timeout || 20000, false);
    if (report.ready === false) {
      report.warning =
        'Lifecycle never called handlePage (ready / syncIsReady / overviewIsReady). Values are evaluated anyway.';
    }

    const v = report.values;
    const expected: any = {};
    v.isSyncPage = await capture('sync.isSyncPage', () => page.isSyncPage(url));
    if (page.isOverviewPage) {
      v.isOverviewPage = await capture('overview.isOverviewPage', () => page.isOverviewPage!(url));
    }

    if (v.isSyncPage.value) {
      const { sync } = page;
      report.type = 'sync';
      v.title = await capture('sync.getTitle', () => sync.getTitle(url));
      v.identifier = await capture('sync.getIdentifier', () => sync.getIdentifier(url));
      v.episode = await capture('sync.getEpisode', () => sync.getEpisode(url));
      if (sync.getVolume) v.volume = await capture('sync.getVolume', () => sync.getVolume!(url));
      if (sync.getSeason) v.season = await capture('sync.getSeason', () => sync.getSeason!(url));
      if (sync.getRuleSet) v.ruleSet = await capture('sync.getRuleSet', () => sync.getRuleSet!(url));
      v.overviewUrl = await capture('sync.getOverviewUrl', () => sync.getOverviewUrl(url));
      if (sync.nextEpUrl) v.nextEpUrl = await capture('sync.nextEpUrl', () => sync.nextEpUrl!(url));
      if (sync.getImage) v.image = await capture('sync.getImage', () => sync.getImage!());
      if (sync.uiSelector) {
        v.uiInjection = await capture('sync.uiInjection', () => uiCheck(sync.uiSelector!));
      }
      if (sync.readerConfig) {
        v.readerConfig = await capture('sync.readerConfig', () =>
          sync.readerConfig!.map((config: any) => ({
            condition: config.condition ? config.condition() : undefined,
            current: config.current.callback ? config.current.callback() : config.current,
            total: config.total.callback ? config.total.callback() : config.total,
          })),
        );
      }

      expected.sync = true;
      expected.title = v.title.value;
      expected.identifier = v.identifier.value;
      expected.episode = parseInt(`${v.episode.value}`);
      if (v.volume) expected.volume = parseInt(`${v.volume.value}`);
      addSeasonExpected(v, expected);
      expected.overviewUrl = v.overviewUrl.value;
      if (v.nextEpUrl) expected.nextEpUrl = v.nextEpUrl.value;
      if (v.image) expected.image = v.image.value;
      if (v.uiInjection && v.uiInjection.value) expected.uiSelector = v.uiInjection.value.text === 'TEST-UI';
    } else if (page.overview && (!page.isOverviewPage || v.isOverviewPage.value)) {
      const { overview } = page;
      report.type = 'overview';
      v.title = await capture('overview.getTitle', () => overview.getTitle(url));
      v.identifier = await capture('overview.getIdentifier', () => overview.getIdentifier(url));
      if (overview.getSeason) v.season = await capture('overview.getSeason', () => overview.getSeason!(url));
      if (overview.getRuleSet) {
        v.ruleSet = await capture('overview.getRuleSet', () => overview.getRuleSet!(url));
      }
      if (overview.getImage) v.image = await capture('overview.getImage', () => overview.getImage!());
      if (overview.uiSelector) {
        v.uiInjection = await capture('overview.uiInjection', () => uiCheck(overview.uiSelector!));
      }

      expected.sync = false;
      expected.title = v.title.value;
      expected.identifier = v.identifier.value;
      addSeasonExpected(v, expected);
      if (v.image) expected.image = v.image.value;
      if (v.uiInjection && v.uiInjection.value) expected.uiSelector = v.uiInjection.value.text === 'TEST-UI';
    }

    if (page.overview && page.overview.list) {
      const { list } = page.overview;
      v.list = await capture('list', () => {
        const elements = list.elementsSelector().toArray();
        // Keyed by episode number like tests.json
        const epList: { [ep: string]: string } = {};
        elements.forEach(el => {
          try {
            epList[parseInt(`${list.elementEp(j.$(el))}`)] = list.elementUrl!(j.$(el));
          } catch (e) {
            // Same as the test runner, broken elements are skipped
          }
        });
        return {
          count: elements.length,
          first: elements.slice(0, 3).map(el => ({
            element: describeElement(el),
            episode: list.elementEp(j.$(el)),
            url: list.elementUrl ? list.elementUrl(j.$(el)) : undefined,
          })),
          epList: Object.keys(epList).length ? epList : undefined,
        };
      });
      if (report.type !== 'none' && v.list.value && v.list.value.epList) {
        expected.epList = v.list.value.epList;
      }
    }

    if (report.type !== 'none') report.expected = expected;
    // Errors that do not belong to a field, for example from the lifecycle
    report.errors = errors.filter(error => !capturedErrors.has(error));
    return report;
  },
};

// @ts-ignore
window.ChibiDev = ChibiDev;
// @ts-ignore
if (typeof window.$c === 'undefined') window.$c = $c;

// Page data from the chibi dev extension, see test/chibiDev/extension/bridge.js
window.addEventListener('chibi-dev-data', event => {
  ChibiDev.setPages(JSON.parse((event as CustomEvent<string>).detail));
});
window.dispatchEvent(new CustomEvent('chibi-dev-request'));
