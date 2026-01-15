import type { mangaProgressConfig } from 'src/utils/mangaProgress/MangaProgress';
import { $c } from '../../chibiScript/ChibiGenerator';
import { PageInterfaceCompiled } from '../pageInterface';
import { pages } from '../pages';
import { getVersionHashes } from './chibiHelper';

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

export default (): { [key: string]: PageInterfaceCompiled } => {
  const definitions: { [key: string]: PageInterfaceCompiled } = {};
  const hashes = getVersionHashes();

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key] as PageInterfaceCompiled;
    pageObj.version = hashes[key];
    definitions[key] = compilePage(pageObj);
  });

  return definitions;
};
