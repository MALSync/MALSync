import { doesUrlMatchPatterns } from 'webext-patterns';
import type { ChibiJson } from '../chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../chibiScript/ChibiConsumer';
import { pageInterface } from '../pages/pageInterface';
import { ChibiListRepository } from './loader/ChibiListRepository';

function getConsumer(code: ChibiJson<any>, page: pageInterface) {
  const cons = new ChibiConsumer(code);
  cons.addVariable('pageObject', page);
  return cons;
}

function getUrlConsumer(code: ChibiJson<any>, url: string, page: pageInterface) {
  const consumer = getConsumer(code, page);
  consumer.addVariable('url', url);
  return consumer;
}

export const Chibi = async (): Promise<pageInterface> => {
  const repo = await new ChibiListRepository([chrome.runtime.getURL('chibi')]).init();
  const allPages = repo.getList();

  const currentUrl = window.location.href;
  const matchingPages = Object.values(allPages).filter(el => {
    if (!el.urls.match || !el.urls.match.length) return false;
    return doesUrlMatchPatterns(currentUrl, ...el.urls.match);
  });

  if (matchingPages.length === 0) {
    throw new Error('No matching page found');
  }
  if (matchingPages.length > 1) {
    con.error('Multiple matching pages found', matchingPages);
  }

  const currentPage = await repo.getPage(matchingPages[0].key);

  const pageD: pageInterface = {
    name: currentPage.name,
    database: currentPage.database || undefined,
    domain: currentPage.domain,
    languages: currentPage.languages,
    type: currentPage.type,
    isSyncPage(url) {
      const consumer = getUrlConsumer(currentPage.sync.isSyncPage, url, pageD);
      return consumer.run();
    },
    isOverviewPage: currentPage.overview
      ? url => {
          const consumer = getUrlConsumer(currentPage.overview!.isOverviewPage, url, pageD);
          return consumer.run();
        }
      : undefined,
    sync: {
      getTitle(url) {
        const consumer = getUrlConsumer(currentPage.sync.getTitle, url, pageD);
        return consumer.run();
      },
      getIdentifier(url) {
        const consumer = getUrlConsumer(currentPage.sync.getIdentifier, url, pageD);
        return consumer.run();
      },
      getOverviewUrl(url) {
        const consumer = getUrlConsumer(currentPage.sync.getOverviewUrl, url, pageD);
        return consumer.run();
      },
      getEpisode(url) {
        const consumer = getUrlConsumer(currentPage.sync.getEpisode, url, pageD);
        return consumer.run();
      },
      getVolume: currentPage.sync.getVolume
        ? url => {
            const consumer = getUrlConsumer(currentPage.sync.getVolume!, url, pageD);
            return consumer.run();
          }
        : undefined,
      nextEpUrl: currentPage.sync.nextEpUrl
        ? url => {
            const consumer = getUrlConsumer(currentPage.sync.nextEpUrl!, url, pageD);
            return consumer.run();
          }
        : undefined,
      uiSelector: currentPage.sync.uiInjection
        ? html => {
            const consumer = getConsumer(currentPage.sync.uiInjection!, pageD);
            consumer.addVariable('ui', html);
            return consumer.run();
          }
        : undefined,
      getMalUrl: currentPage.sync.getMalUrl
        ? provider => {
            const consumer = getConsumer(currentPage.sync.getMalUrl!, pageD);
            consumer.addVariable('provider', provider);
            return consumer.run();
          }
        : undefined,
    },
    overview: currentPage.overview
      ? {
          getTitle(url) {
            const consumer = getUrlConsumer(currentPage.overview!.getTitle, url, pageD);
            return consumer.run();
          },
          getIdentifier(url) {
            const consumer = getUrlConsumer(currentPage.overview!.getIdentifier, url, pageD);
            return consumer.run();
          },
          uiSelector(html) {
            const consumer = getConsumer(currentPage.overview!.uiInjection, pageD);
            consumer.addVariable('ui', html);
            return consumer.run();
          },
          getMalUrl: currentPage.overview.getMalUrl
            ? provider => {
                const consumer = getConsumer(currentPage.overview!.getMalUrl!, pageD);
                consumer.addVariable('provider', provider);
                return consumer.run();
              }
            : undefined,
        }
      : undefined,
    init(page) {
      const logger = con.m('Chibi');

      let activeConsumer: ChibiConsumer | null = null;
      let defaultInterval: NodeJS.Timer | null = null;

      const setupConsumer = getConsumer(currentPage.lifecycle.setup, pageD);
      setupConsumer.run();

      const readyConsumer = getConsumer(currentPage.lifecycle.ready, pageD);
      readyConsumer.addVariable('trigger', () => {
        logger.info('Ready Trigger');
        if (activeConsumer) {
          activeConsumer.clearIntervals();
          activeConsumer = null;
        }
        clearInterval(defaultInterval!);
        page.reset();

        const pageReady = () => {
          logger.info('Handle page');
          page.handlePage();
        };

        if (pageD.isSyncPage(window.location.href)) {
          logger.info('Is Sync Page');
          if (currentPage.lifecycle.syncIsReady) {
            activeConsumer = getConsumer(currentPage.lifecycle.syncIsReady, pageD);
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                pageD.sync.getTitle(window.location.href) &&
                pageD.sync.getIdentifier(window.location.href),
              pageReady,
              100,
            );
          }
        } else if (pageD.isOverviewPage && pageD.isOverviewPage(window.location.href)) {
          logger.info('Is Overview Page');
          if (currentPage.lifecycle.overviewIsReady) {
            activeConsumer = getConsumer(currentPage.lifecycle.overviewIsReady, pageD);
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                pageD.overview!.getTitle(window.location.href) &&
                pageD.overview!.getIdentifier(window.location.href),
              pageReady,
              100,
            );
          }
        } else {
          logger.info('Not a sync or overview page');
        }
      });
      readyConsumer.runAsync();
    },
  };

  return pageD;
};
