/* eslint-disable no-bitwise */
import { $c } from '../../chibiScript/ChibiGenerator';
import type { mangaProgressConfig } from '../../utils/mangaProgress/MangaProgress';
import type { PageInterface, PageInterfaceCompiled, PageListJsonInterface } from '../pageInterface';

export function getVersionHashes(pages: { [key: string]: PageInterface }) {
  const hashes: {
    [key: string]: {
      hash: string;
      timestamp: string;
    };
  } = {};
  Object.keys(pages)
    .sort()
    .forEach(key => {
      const pageObj = pages[key];
      const pageString = objectToString(pageObj);
      hashes[key] = {
        hash: createShortHash(pageString),
        timestamp: new Date().getTime().toString(),
      };
    });
  return hashes;
}

function objectToString(obj: any): string {
  const result = {};

  Object.keys(obj)
    .sort()
    .forEach(key => {
      const value = obj[key];
      if (typeof value === 'function') {
        const fnStr = value.toString().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
        result[key] = fnStr;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = objectToString(value);
      } else {
        result[key] = value;
      }
    });

  return JSON.stringify(result);
}

function createShortHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }

  return (hash >>> 0).toString(16).slice(-8).padStart(8, '0');
}

export function chibiList(pages: { [key: string]: PageInterface }): PageListJsonInterface {
  const definitions: PageListJsonInterface = {
    pages: {},
  };
  const hashes = getVersionHashes(pages);

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key];
    definitions.pages[key] = {
      key,
      name: pageObj.name,
      version: hashes[key],
      minimumVersion: pageObj.minimumVersion || undefined,
      type: pageObj.type,
      domain: pageObj.domain,
      languages: pageObj.languages,
      urls: pageObj.urls,
      search: pageObj.search,
      database: pageObj.database,
      features: pageObj.features,
    };
  });

  return definitions;
}

function compilePage(page: PageInterfaceCompiled): PageInterfaceCompiled {
  page.sync.isSyncPage = page.sync.isSyncPage($c) as any;
  page.sync.getTitle = page.sync.getTitle($c) as any;
  page.sync.getIdentifier = page.sync.getIdentifier($c) as any;
  page.sync.getOverviewUrl = page.sync.getOverviewUrl($c) as any;
  page.sync.getEpisode = page.sync.getEpisode($c) as any;
  if (page.sync.getVolume) {
    page.sync.getVolume = page.sync.getVolume($c) as any;
  }
  if (page.sync.getImage) {
    page.sync.getImage = page.sync.getImage($c) as any;
  }
  if (page.sync.nextEpUrl) {
    page.sync.nextEpUrl = page.sync.nextEpUrl($c) as any;
  }
  if (page.sync.uiInjection) {
    page.sync.uiInjection = page.sync.uiInjection($c) as any;
  }
  if (page.sync.getMalUrl) {
    page.sync.getMalUrl = page.sync.getMalUrl($c) as any;
  }

  if (page.sync.readerConfig) {
    const temp: mangaProgressConfig[] = [];

    page.sync.readerConfig.forEach(config => {
      if (typeof config.current === 'function') {
        const tempConfig: mangaProgressConfig = {
          current: (config.current as any)($c),
          total: (config.total as any)($c),
        };
        if (config.condition) {
          tempConfig.condition = (config.condition as any)($c);
        }
        temp.push(tempConfig);
      } else {
        temp.push(config as mangaProgressConfig);
      }
    });

    page.sync.readerConfig = temp;
  }

  if (page.overview) {
    page.overview.isOverviewPage = page.overview.isOverviewPage($c) as any;
    page.overview.getTitle = page.overview.getTitle($c) as any;
    page.overview.getIdentifier = page.overview.getIdentifier($c) as any;
    page.overview.uiInjection = page.overview.uiInjection($c) as any;
    if (page.overview.getImage) {
      page.overview.getImage = page.overview.getImage($c) as any;
    }
    if (page.overview.getMalUrl) {
      page.overview.getMalUrl = page.overview.getMalUrl($c) as any;
    }
  }

  if (page.list) {
    page.list.elementsSelector = page.list.elementsSelector($c) as any;
    page.list.elementEp = page.list.elementEp($c as any) as any;
    if (page.list.elementUrl) {
      page.list.elementUrl = page.list.elementUrl($c as any) as any;
    }
  }

  page.lifecycle.setup = page.lifecycle.setup($c) as any;
  page.lifecycle.ready = page.lifecycle.ready($c) as any;
  if (page.lifecycle.syncIsReady) {
    page.lifecycle.syncIsReady = page.lifecycle.syncIsReady($c) as any;
  }
  if (page.lifecycle.overviewIsReady) {
    page.lifecycle.overviewIsReady = page.lifecycle.overviewIsReady($c) as any;
  }
  if (page.lifecycle.listChange) {
    page.lifecycle.listChange = page.lifecycle.listChange($c) as any;
  }

  if (page.computedType) {
    page.computedType = page.computedType($c) as any;
  }

  return page;
}

export function chibiPages(pages: { [key: string]: PageInterface }): {
  [key: string]: PageInterfaceCompiled;
} {
  const definitions: { [key: string]: PageInterfaceCompiled } = {};
  const hashes = getVersionHashes(pages);

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key] as PageInterfaceCompiled;
    pageObj.version = hashes[key];
    definitions[key] = compilePage(pageObj);
  });

  return definitions;
}
