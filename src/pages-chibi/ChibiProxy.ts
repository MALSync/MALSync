import { doesUrlMatchPatterns } from 'webext-patterns';
import type { mangaProgressConfig } from 'src/utils/mangaProgress/MangaProgress';
import { NotFoundError } from '../_provider/Errors';
import type { ChibiJson } from '../chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../chibiScript/ChibiConsumer';
import { pageInterface } from '../pages/pageInterface';
import { ChibiListRepository } from './loader/ChibiListRepository';

function getConsumer(code: ChibiJson<any>, page: pageInterface, name: string) {
  const cons = new ChibiConsumer(code, name);
  cons.addVariable('pageObject', page);
  return cons;
}

function getUrlConsumer(code: ChibiJson<any>, url: string, page: pageInterface, name: string) {
  const consumer = getConsumer(code, page, name);
  consumer.addVariable('url', url);
  return consumer;
}

export const Chibi = async (): Promise<pageInterface> => {
  const repo = await ChibiListRepository.getInstance().init();
  const allPages = repo.getList();

  const currentUrl = window.location.href;
  const matchingPages = Object.values(allPages).filter(el => {
    if (!el.urls.match || !el.urls.match.length) return false;
    return doesUrlMatchPatterns(currentUrl, ...el.urls.match);
  });

  if (matchingPages.length === 0) {
    throw new NotFoundError('No matching page found');
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
      const consumer = getUrlConsumer(currentPage.sync.isSyncPage, url, pageD, 'sync.isSyncPage');
      return consumer.run();
    },
    isOverviewPage: currentPage.overview
      ? url => {
          const consumer = getUrlConsumer(
            currentPage.overview!.isOverviewPage,
            url,
            pageD,
            'overview.isOverviewPage',
          );
          return consumer.run();
        }
      : undefined,
    sync: {
      getTitle(url) {
        const consumer = getUrlConsumer(currentPage.sync.getTitle, url, pageD, 'sync.getTitle');
        return consumer.run() || '';
      },
      getIdentifier(url) {
        const consumer = getUrlConsumer(
          currentPage.sync.getIdentifier,
          url,
          pageD,
          'sync.getIdentifier',
        );
        return consumer.run();
      },
      getOverviewUrl(url) {
        const consumer = getUrlConsumer(
          currentPage.sync.getOverviewUrl,
          url,
          pageD,
          'sync.getOverviewUrl',
        );
        return consumer.run();
      },
      getEpisode(url) {
        const consumer = getUrlConsumer(currentPage.sync.getEpisode, url, pageD, 'sync.getEpisode');
        return consumer.run();
      },
      getVolume: currentPage.sync.getVolume
        ? url => {
            const consumer = getUrlConsumer(
              currentPage.sync.getVolume!,
              url,
              pageD,
              'sync.getVolume',
            );
            return consumer.run();
          }
        : undefined,
      getImage: currentPage.sync.getImage
        ? () => {
            const consumer = getConsumer(currentPage.sync.getImage!, pageD, 'sync.getImage');
            return consumer.run();
          }
        : undefined,
      nextEpUrl: currentPage.sync.nextEpUrl
        ? url => {
            const consumer = getUrlConsumer(
              currentPage.sync.nextEpUrl!,
              url,
              pageD,
              'sync.nextEpUrl',
            );
            return consumer.run();
          }
        : undefined,
      uiSelector: currentPage.sync.uiInjection
        ? html => {
            const consumer = getConsumer(currentPage.sync.uiInjection!, pageD, 'sync.uiInjection');
            consumer.addVariable('ui', html);
            const value = consumer.run();
            consumer.emitEvent('overview.uiSelector');
            return value;
          }
        : undefined,
      getMalUrl: currentPage.sync.getMalUrl
        ? provider => {
            const consumer = getConsumer(currentPage.sync.getMalUrl!, pageD, 'sync.getMalUrl');
            consumer.addVariable('provider', provider);
            return consumer.run();
          }
        : undefined,
      readerConfig: currentPage.sync.readerConfig
        ? (currentPage.sync.readerConfig as any)
        : undefined,
    },
    overview:
      currentPage.overview || currentPage.list
        ? {
            getTitle(url) {
              const consumer = getUrlConsumer(
                currentPage.overview!.getTitle,
                url,
                pageD,
                'overview.getTitle',
              );
              return consumer.run() || '';
            },
            getIdentifier(url) {
              const consumer = getUrlConsumer(
                currentPage.overview!.getIdentifier,
                url,
                pageD,
                'overview.getIdentifier',
              );
              return consumer.run();
            },
            uiSelector(html) {
              const consumer = getConsumer(
                currentPage.overview!.uiInjection,
                pageD,
                'overview.uiInjection',
              );
              consumer.addVariable('ui', html);
              const value = consumer.run();
              consumer.emitEvent('overview.uiSelector');
              return value;
            },
            getImage: currentPage.overview?.getImage
              ? () => {
                  const consumer = getConsumer(
                    currentPage.overview!.getImage!,
                    pageD,
                    'overview.getImage',
                  );
                  return consumer.run();
                }
              : undefined,
            getMalUrl:
              currentPage.overview && currentPage.overview.getMalUrl
                ? provider => {
                    const consumer = getConsumer(
                      currentPage.overview!.getMalUrl!,
                      pageD,
                      'overview.getMalUrl',
                    );
                    consumer.addVariable('provider', provider);
                    return consumer.run();
                  }
                : undefined,
            list: currentPage.list
              ? {
                  offsetHandler: false,
                  elementsSelector() {
                    const consumer = getConsumer(
                      currentPage.list!.elementsSelector,
                      pageD,
                      'list.elementsSelector',
                    );
                    return j.$(consumer.run());
                  },
                  elementUrl: currentPage.list.elementUrl
                    ? selector => {
                        if (selector instanceof j.$) {
                          selector = selector.get(0) as any;
                        }

                        const consumer = getConsumer(
                          currentPage.list!.elementUrl!,
                          pageD,
                          'list.elementUrl',
                        );
                        consumer.addVariable('element', selector);
                        return consumer.run(selector);
                      }
                    : undefined,
                  elementEp(selector) {
                    if (selector instanceof j.$) {
                      selector = selector.get(0) as any;
                    }

                    const consumer = getConsumer(
                      currentPage.list!.elementEp,
                      pageD,
                      'list.elementEp',
                    );
                    consumer.addVariable('element', selector);
                    return consumer.run(selector);
                  },
                }
              : undefined,
          }
        : undefined,
    init(page) {
      const logger = con.m('Chibi');

      let activeConsumer: ChibiConsumer | null = null;
      let defaultInterval: NodeJS.Timer | null = null;

      const setupConsumer = getConsumer(currentPage.lifecycle.setup, pageD, 'setup');
      setupConsumer.run();

      const readyConsumer = getConsumer(currentPage.lifecycle.ready, pageD, 'ready');
      readyConsumer.addVariable('trigger', () => {
        logger.info('Ready Trigger');
        if (activeConsumer) {
          activeConsumer.clearIntervals();
          activeConsumer = null;
        }
        clearInterval(defaultInterval!);
        page.reset();

        const pageReady = () => {
          if (currentPage.computedType) {
            logger.m('Type').info('Computing type...');
            const typeConsumer = getConsumer(currentPage.computedType, pageD, 'computedType');
            const computedType = typeConsumer.run();
            if (computedType) {
              logger.m('Type').info('Computed type:', computedType);
              let type = computedType;
              let isNovel = false;
              if (type === 'novel') {
                type = 'manga';
                isNovel = true;
              }
              pageD.type = type;
              page.novel = isNovel;
            }
          }

          logger.info('Handle page');
          page.handlePage();
        };

        if (pageD.isSyncPage(window.location.href)) {
          logger.info('Is Sync Page');
          if (currentPage.lifecycle.syncIsReady) {
            activeConsumer = getConsumer(currentPage.lifecycle.syncIsReady, pageD, 'syncIsReady');
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                pageD.sync.getTitle(window.location.href) &&
                pageD.sync.getIdentifier(window.location.href),
              pageReady,
            );
          }
        } else if (pageD.isOverviewPage && pageD.isOverviewPage(window.location.href)) {
          logger.info('Is Overview Page');
          if (currentPage.lifecycle.overviewIsReady) {
            activeConsumer = getConsumer(
              currentPage.lifecycle.overviewIsReady,
              pageD,
              'overviewIsReady',
            );
            activeConsumer.addVariable('trigger', pageReady);
            activeConsumer.runAsync();
          } else {
            defaultInterval = utils.waitUntilTrue(
              () =>
                pageD.overview!.getTitle(window.location.href) &&
                pageD.overview!.getIdentifier(window.location.href),
              pageReady,
            );
          }
        } else {
          logger.info('Not a sync or overview page');
        }
      });
      readyConsumer.runAsync();

      if (currentPage.lifecycle.listChange) {
        const listConsumer = getConsumer(currentPage.lifecycle.listChange, pageD, 'listChange');
        listConsumer.addVariable('trigger', () => {
          logger.info('List Trigger');
          page.handleList();
        });
        listConsumer.runAsync();
      }
    },
  };

  if (pageD.sync.readerConfig) {
    pageD.sync.readerConfig = handleReaderConfig(
      currentPage.sync.readerConfig as any,
      pageD,
      'sync.readerConfig',
    );
  }

  return pageD;
};

function handleReaderConfig(
  config: (
    | mangaProgressConfig
    | { current?: ChibiJson<any>; total: ChibiJson<any>; condition: ChibiJson<any> }
  )[],
  page,
  name: string,
): mangaProgressConfig[] {
  const temp: mangaProgressConfig[] = [];

  config.forEach((config, index) => {
    if (Array.isArray(config.current)) {
      const tempConfig: mangaProgressConfig = {
        current: {
          mode: 'callback',
          callback: () =>
            getConsumer(config.current as ChibiJson<any>, page, `${name}[${index}].current`).run(),
        },
        total: {
          mode: 'callback',
          callback: () =>
            getConsumer(config.total as ChibiJson<any>, page, `${name}[${index}].total`).run(),
        },
      };
      if (config.condition) {
        tempConfig.condition = () =>
          getConsumer(
            config.condition as ChibiJson<any>,
            page,
            `${name}[${index}].condition`,
          ).run();
      }
      temp.push(tempConfig);
    } else {
      temp.push(config as mangaProgressConfig);
    }
  });

  return temp;
}
