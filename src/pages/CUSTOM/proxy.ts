import jQuery from 'jquery';
import { customPageInterface } from './customPageInterface';
import { FunctionProxy } from '../../utils/functionProxy';
import { generateUniqueID } from '../../utils/scriptProxyWrapper';
import { simplePageInterface } from './simplePage';

export function script() {
  const logger = con.m('Custom Page');
  const functionProxy = new FunctionProxy(1);
  return new Promise<customPageInterface | undefined>(resolve => {
    const timer = setInterval(() => {
      if (Object.prototype.hasOwnProperty.call(window, 'getMALSyncPage')) {
        clearInterval(timer);
        logger.log('MALSyncPage found');
        (globalThis as any).jQuery = jQuery;
        const customPage: simplePageInterface = (window as any).getMALSyncPage!({
          con,
          j: require('../../utils/j'),
          utils: require('../../utils/general'),
        });
        const result: customPageInterface = {
          style: customPage.style,
          isOverviewPage: typeof customPage.isOverviewPage === 'function',
          getImage: typeof customPage.getImage === 'function',
          sync: {
            getVolume: typeof customPage.sync.getVolume === 'function',
            nextEpUrl: typeof customPage.sync.nextEpUrl === 'function',
            uiSelector: typeof customPage.sync.uiSelector === 'function',
            getMalUrl: typeof customPage.sync.getMalUrl === 'function',
            readerConfig: customPage.sync.readerConfig?.map(config => ({
              condition: typeof config.condition === 'function' ? true : config.condition,
              current: config.current,
              total: config.total,
            })),
          },
          overview: customPage.overview
            ? {
                getMalUrl: typeof customPage.overview.getMalUrl === 'function',
                list: customPage.overview.list
                  ? {
                      offsetHandler: customPage.overview.list.offsetHandler,
                      elementUrl: typeof customPage.overview.list.elementUrl === 'function',
                      paginationNext: typeof customPage.overview.list.paginationNext === 'function',
                      handleListHook: typeof customPage.overview.list.handleListHook === 'function',
                      getTotal: typeof customPage.overview.list.getTotal === 'function',
                    }
                  : undefined,
              }
            : undefined,
        };
        functionProxy
          .init((method, args) => {
            switch (method) {
              case 'isSyncPage':
                return customPage.isSyncPage(args[0]);
              case 'isOverviewPage':
                return customPage.isOverviewPage!(args[0]);
              case 'getImage':
                return customPage.getImage!();
              case 'sync.getTitle':
                return customPage.sync.getTitle(args[0]);
              case 'sync.getIdentifier':
                return customPage.sync.getIdentifier(args[0]);
              case 'sync.getOverviewUrl':
                return customPage.sync.getOverviewUrl(args[0]);
              case 'sync.getEpisode':
                return customPage.sync.getEpisode(args[0]);
              case 'sync.getVolume':
                return customPage.sync.getVolume!(args[0]);
              case 'sync.nextEpUrl':
                return customPage.sync.nextEpUrl!(args[0]);
              case 'sync.uiSelector':
                return customPage.sync.uiSelector!(args[0]);
              case 'sync.getMalUrl':
                return customPage.sync.getMalUrl!(args[0]);
              case 'overview.getTitle':
                return customPage.overview?.getTitle(args[0]);
              case 'overview.getIdentifier':
                return customPage.overview?.getIdentifier(args[0]);
              case 'overview.uiSelector':
                return customPage.overview?.uiSelector(args[0]);
              case 'overview.getMalUrl':
                return customPage.overview?.getMalUrl!(args[0]);
              case 'overview.list.elementsSelector': {
                const elements = customPage.overview?.list?.elementsSelector!();
                return elements?.map(function () {
                  const element = jQuery(this);
                  const id = element.attr('data-mal-sync-id') ?? generateUniqueID();
                  element.attr({
                    'data-mal-sync-id': id,
                    'data-mal-sync-url': customPage.overview?.list?.elementUrl!(element),
                    'data-mal-sync-ep': customPage.overview?.list?.elementEp(element),
                  });
                  return id;
                }).toArray!();
              }
              case 'overview.list.paginationNext': {
                return Promise.resolve(customPage.overview?.list?.paginationNext!(args[0])).then(
                  result => {
                    const elements = customPage.overview?.list?.elementsSelector!();
                    elements?.each(function () {
                      const element = jQuery(this);
                      element.attr({
                        'data-mal-sync-url': customPage.overview?.list?.elementUrl!(element),
                        'data-mal-sync-ep': customPage.overview?.list?.elementEp(element),
                      });
                    });
                    return result;
                  },
                );
              }
              case 'overview.list.handleListHook':
                return customPage.overview?.list?.handleListHook!(
                  args[0],
                  (args[1] as string[]).map(id => jQuery(`[data-mal-sync-id=${id}]`)),
                );
              case 'overview.list.getTotal':
                return customPage.overview?.list?.getTotal!();
              case 'init': {
                let resetPromise = Promise.resolve();
                return customPage.init({
                  page: customPage,
                  async handlePage(curUrl: string = window.location.href) {
                    return resetPromise.then(() =>
                      functionProxy.invoke('page.handlePage', [curUrl]),
                    );
                  },
                  async handleList(searchCurrent: boolean = false, reTry: number = 0) {
                    return resetPromise.then(() =>
                      functionProxy.invoke('page.handleList', [searchCurrent, reTry]),
                    );
                  },
                  async reset() {
                    resetPromise = functionProxy.invoke('page.reset', []);
                    return resetPromise;
                  },
                });
              }
              default: {
                const index = method.match(/^sync\.readerConfig\[(\d+)\]\.condition$/)![1];
                if (index) {
                  return customPage.sync?.readerConfig![index].condition();
                }
                return undefined;
              }
            }
          })
          .then(() => {});
        resolve(result);
      } else if (performance.now() > 5000) {
        clearInterval(timer);
        logger.log('MALSyncPage not found');
        resolve(undefined);
      }
    }, 100);
  });
}
