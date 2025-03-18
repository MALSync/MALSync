import { doesUrlMatchPatterns } from 'webext-patterns';
import type { ChibiJson } from '../chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../chibiScript/ChibiConsumer';
import { pageInterface } from '../pages/pageInterface';
import { ChibiListRepository } from './loader/ChibiListRepository';

function getConsumer(code: ChibiJson<any>) {
  return new ChibiConsumer(code);
}

function getUrlConsumer(code: ChibiJson<any>, url: string) {
  const consumer = getConsumer(code);
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

  return {
    name: currentPage.name,
    database: currentPage.database || undefined,
    domain: currentPage.domain,
    languages: currentPage.languages,
    type: currentPage.type,
    isSyncPage(url) {
      const consumer = getUrlConsumer(currentPage.sync.isSyncPage, url);
      return consumer.run();
    },
    isOverviewPage: currentPage.overview
      ? url => {
          const consumer = getUrlConsumer(currentPage.overview!.isOverviewPage, url);
          return consumer.run();
        }
      : undefined,
    sync: {
      getTitle(url) {
        const consumer = getUrlConsumer(currentPage.sync.getTitle, url);
        return consumer.run();
      },
      getIdentifier(url) {
        const consumer = getUrlConsumer(currentPage.sync.getIdentifier, url);
        return consumer.run();
      },
      getOverviewUrl(url) {
        const consumer = getUrlConsumer(currentPage.sync.getOverviewUrl, url);
        return consumer.run();
      },
      getEpisode(url) {
        const consumer = getUrlConsumer(currentPage.sync.getEpisode, url);
        return consumer.run();
      },
      getVolume: currentPage.sync.getVolume
        ? url => {
            const consumer = getUrlConsumer(currentPage.sync.getVolume!, url);
            return consumer.run();
          }
        : undefined,
      nextEpUrl: currentPage.sync.nextEpUrl
        ? url => {
            const consumer = getUrlConsumer(currentPage.sync.nextEpUrl!, url);
            return consumer.run();
          }
        : undefined,
      uiSelector: currentPage.sync.uiInjection
        ? html => {
            const consumer = getConsumer(currentPage.sync.uiInjection!);
            consumer.addVariable('ui', html);
            return consumer.run();
          }
        : undefined,
      getMalUrl: currentPage.sync.getMalUrl
        ? provider => {
            const consumer = getConsumer(currentPage.sync.getMalUrl!);
            consumer.addVariable('provider', provider);
            return consumer.run();
          }
        : undefined,
    },
    overview: currentPage.overview
      ? {
          getTitle(url) {
            const consumer = getUrlConsumer(currentPage.overview!.getTitle, url);
            return consumer.run();
          },
          getIdentifier(url) {
            const consumer = getUrlConsumer(currentPage.overview!.getIdentifier, url);
            return consumer.run();
          },
          uiSelector(url) {
            const consumer = getUrlConsumer(currentPage.overview!.uiInjection, url);
            return consumer.run();
          },
          getMalUrl: currentPage.overview.getMalUrl
            ? provider => {
                const consumer = getConsumer(currentPage.overview!.getMalUrl!);
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

      const setupConsumer = getConsumer(currentPage.lifecycle.setup);
      setupConsumer.run();

      const readyConsumer = getConsumer(currentPage.lifecycle.ready);
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

        if (this.isSyncPage(window.location.href)) {
          logger.info('Is Sync Page');
          if (currentPage.lifecycle.syncIsReady) {
            activeConsumer = getConsumer(currentPage.lifecycle.syncIsReady);
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                this.sync.getTitle(window.location.href) &&
                this.sync.getIdentifier(window.location.href),
              pageReady,
              100,
            );
          }
        } else if (this.isOverviewPage(window.location.href)) {
          logger.info('Is Sync Page');
          if (currentPage.lifecycle.overviewIsReady) {
            activeConsumer = getConsumer(currentPage.lifecycle.overviewIsReady);
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                this.overview.getTitle(window.location.href) &&
                this.overview.getIdentifier(window.location.href),
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
};
