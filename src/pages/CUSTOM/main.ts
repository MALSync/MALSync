import { pageInterface } from '../pageInterface';
import { customPageInterface } from './customPageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';
import { mangaProgressConfig } from '../../utils/mangaProgress/MangaProgress';
import { FunctionProxy } from '../../utils/functionProxy';
import { generateUniqueID } from '../../utils/scriptProxyWrapper';

export function getPageInterface(name: string, type: 'anime' | 'manga'): pageInterface {
  const functionProxy = new FunctionProxy(2);

  function useCache<A extends any[], T>(
    fn: (...args: A) => Promise<T>,
    defaultValue: T,
  ): (...args: A) => T {
    interface CacheEntry<T> {
      value: T;
      next: Map<any, CacheEntry<T>>;
    }

    const cache: CacheEntry<T> = {
      value: defaultValue,
      next: new Map<any, CacheEntry<T>>(),
    };
    return function (...args) {
      let entry = cache;
      for (let i = 0; i < args.length; i++) {
        let next = entry.next.get(args[i]);
        if (!next) {
          next = {
            value: defaultValue,
            next: new Map<any, CacheEntry<T>>(),
          };
          entry.next.set(args[i], next);
        }
        entry = next;
      }
      const promise = fn(...args).then(result => {
        entry.value = result;
        return result;
      });
      if (this.valueOf() === 'async') {
        return promise as T;
      }
      return entry.value;
    };
  }

  const proxy = new ScriptProxy<customPageInterface | undefined>(name);

  const MALSyncPage: pageInterface = {
    name,
    type,
    domain: 'https://www.example.com',
    languages: ['English'],
    isSyncPage: useCache(url => functionProxy.invoke('isSyncPage', [url]), true),
    sync: {
      getTitle: useCache(url => functionProxy.invoke('sync.getTitle', [url]), ''),
      getIdentifier: useCache(url => functionProxy.invoke('sync.getIdentifier', [url]), ''),
      getOverviewUrl: useCache(url => functionProxy.invoke('sync.getOverviewUrl', [url]), ''),
      getEpisode: useCache(url => functionProxy.invoke('sync.getEpisode', [url]), 0),
    },
    async init(page) {
      MALSyncPage.domain = window.location.origin;

      async function update() {
        const [isSyncPage, isOverviewPage] = await Promise.all([
          MALSyncPage.isSyncPage.call('async', window.location.href),
          MALSyncPage.isOverviewPage?.call('async', window.location.href),
        ]);
        const promises: any[] = [];
        if (isSyncPage) {
          promises.push(
            MALSyncPage.sync.getTitle.call('async', window.location.href),
            MALSyncPage.sync.getIdentifier.call('async', window.location.href),
            MALSyncPage.sync.getOverviewUrl.call('async', window.location.href),
            MALSyncPage.sync.getEpisode.call('async', window.location.href),
            MALSyncPage.sync.getVolume?.call('async', window.location.href),
            MALSyncPage.sync.nextEpUrl?.call('async', window.location.href),
          );
        }
        if (isOverviewPage) {
          promises.push(
            MALSyncPage.overview?.getTitle.call('async', window.location.href),
            MALSyncPage.overview?.getIdentifier.call('async', window.location.href),
          );
        }
        if (isSyncPage || isOverviewPage) {
          promises.push(
            MALSyncPage.overview?.list?.elementsSelector.call('async'),
            MALSyncPage.getImage?.call('async'),
          );
        }
        await Promise.all(promises);
      }

      await proxy.injectScript();

      const [customPage] = await Promise.all([
        proxy.getData(),
        functionProxy.init(async (method, args) => {
          switch (method) {
            case 'page.handlePage':
              await update();
              return page.handlePage(...args);
            case 'page.handleList':
              await update();
              return page.handleList(...args);
            case 'page.reset':
              return page.reset();
            case 'update':
              return update();
            default:
              return undefined;
          }
        }),
      ]);

      if (customPage) {
        if (customPage.style) {
          const result = await require('less').render(
            [
              require('!to-string-loader!css-loader!../pages.less').toString(),
              customPage.style,
            ].join('\n'),
          );
          api.storage.addStyle(result.css);
        } else {
          api.storage.addStyle(
            require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
          );
        }

        if (customPage.isOverviewPage) {
          MALSyncPage.isOverviewPage = useCache(
            url => functionProxy.invoke('isOverviewPage', [url]),
            true,
          );
        }
        if (customPage.getImage) {
          MALSyncPage.getImage = useCache(() => functionProxy.invoke('getImage', []), '');
        }
        if (customPage.sync.getVolume) {
          MALSyncPage.sync.getVolume = useCache(
            url => functionProxy.invoke('sync.getVolume', [url]),
            0,
          );
        }
        if (customPage.sync.nextEpUrl) {
          MALSyncPage.sync.nextEpUrl = useCache(
            url => functionProxy.invoke('sync.nextEpUrl', [url]),
            '',
          );
        }
        if (customPage.sync.uiSelector) {
          MALSyncPage.sync.uiSelector = selector =>
            functionProxy.invoke('sync.uiSelector', [selector]);
        }
        if (customPage.sync.getMalUrl) {
          MALSyncPage.sync.getMalUrl = useCache(
            provider => functionProxy.invoke('sync.getMalUrl', [provider]),
            false,
          );
        }
        if (customPage.sync.readerConfig) {
          MALSyncPage.sync.readerConfig = customPage.sync.readerConfig.map((config, i) => {
            const newConfig: mangaProgressConfig = {
              current: config.current,
              total: config.total,
            };
            if (typeof config.condition === 'string') {
              newConfig.condition = config.condition;
            } else if (config.condition === true) {
              newConfig.condition = () =>
                functionProxy.invoke(`sync.readerConfig[${i}].condition`, []);
            }
            return newConfig;
          });
        }
        if (customPage?.overview) {
          MALSyncPage.overview = {
            getTitle: useCache(url => functionProxy.invoke('overview.getTitle', [url]), ''),
            getIdentifier: useCache(
              url => functionProxy.invoke('overview.getIdentifier', [url]),
              '',
            ),
            uiSelector(selector) {
              return functionProxy.invoke('overview.uiSelector', [selector]);
            },
          };
          if (customPage.overview.getMalUrl) {
            MALSyncPage.overview.getMalUrl = useCache(
              provider => functionProxy.invoke('overview.getMalUrl', [provider]),
              '',
            );
          }
          if (customPage.overview.list) {
            MALSyncPage.overview.list = {
              offsetHandler: customPage.overview.list.offsetHandler,
              elementsSelector: useCache(
                () =>
                  functionProxy
                    .invoke<[], string[]>('overview.list.elementsSelector', [])
                    .then(ids => j.$(ids.map(id => `[data-mal-sync-id="${id}"]`).join(','))),
                j.$(),
              ),
              elementEp(selector) {
                return parseInt(selector.data('mal-sync-ep') ?? '0');
              },
            };
            MALSyncPage.overview.list.offsetHandler = customPage.overview.list.offsetHandler;
            MALSyncPage.overview.list.elementsSelector = useCache(
              () =>
                functionProxy
                  .invoke<[], string[]>('overview.list.elementsSelector', [])
                  .then(ids => j.$(ids.map(id => `[data-mal-sync-id="${id}"]`).join(','))),
              j.$(),
            );
            if (customPage.overview.list.elementUrl) {
              MALSyncPage.overview.list.elementUrl = selector => selector.data('mal-sync-url');
            }
            if (customPage.overview.list.paginationNext) {
              MALSyncPage.overview.list.paginationNext = updateCheck =>
                functionProxy.invoke('overview.list.paginationNext', [updateCheck]);
            }
            if (customPage.overview.list.handleListHook) {
              MALSyncPage.overview.list.handleListHook = (ep, epList) =>
                functionProxy.invoke('overview.list.handleListHook', [
                  ep,
                  epList.map(e => {
                    const id = generateUniqueID();
                    const element = j.$(e);
                    element.attr('data-mal-sync-id', id);
                    return id;
                  }),
                ]);
            }
            if (customPage.overview.list.getTotal) {
              MALSyncPage.overview.list.getTotal = useCache(
                () => functionProxy.invoke('overview.list.getTotal', []),
                0,
              );
            }
          }
        }
        await update();
        page.reset();
        functionProxy.invoke('init', []);
      }
    },
  };

  Object.assign(global, { MALSyncPage });

  return MALSyncPage;
}
