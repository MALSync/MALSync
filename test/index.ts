import { pages as part1 } from '../src/pages/pages';
import { pages as part2 } from '../src/pages-adult/pages';
import { getPageConfig } from '../src/utils/test';
import { xhrAction } from '../src/background/messageHandler';
import { Chibi } from '../src/pages-chibi/ChibiProxy';
import { NotFoundError } from '../src/_provider/Errors';
import { SyncPage } from 'src/pages/syncPage';

const pages = { ...part1, ...part2 };

// @ts-ignore
window.chrome.runtime.sendMessage = (message: any, callback: (response: any) => void) => {
  if (message.name === 'xhr') {
    return xhrAction(message, 'test', callback, 'testing');
  }
}

// @ts-ignore
window.MalSyncTest = async function() {
  const value: any = {};

  const page = await Chibi().catch(e => {
    if (e instanceof NotFoundError) {
      return getPageConfig(window.location.href, pages);
    }
    throw e;
  });

  console.log('page Found', page);

  if (!page) {
    return 'Page Not Found';
  }
  return new Promise(function(resolve, reject) {
    if (testForCloudflare()) {
      resolve({
        sync: 'cdn',
        type: 'default'
      });
      return;
    }

    const syncPage = new SyncPage(
      window.location.href,
      pages
    );
    
    syncPage.handlePage = async function(url?: string) {
      if (page.isSyncPage(window.location.href)) {
        value.sync = true;
        value.title = page.sync.getTitle(window.location.href);
        value.identifier = page.sync.getIdentifier(window.location.href);
        value.episode = parseInt(
          `${page.sync.getEpisode(window.location.href)}`,
        );
        if (page.sync.getVolume) {
          value.volume = parseInt(`${page.sync.getVolume(window.location.href)}`);
        }
        value.overviewUrl = page.sync.getOverviewUrl(window.location.href);
        if (typeof page.sync.nextEpUrl !== 'undefined') {
          value.nextEpUrl = page.sync.nextEpUrl(window.location.href);
        }
        if (typeof page.sync.uiSelector !== 'undefined') {
          page.sync.uiSelector(
            '<div><div id="MAL-SYNC-TEST">TEST-UI</div></div>'
          );
          value.uiSelector = j.$('#MAL-SYNC-TEST').text();
        }
      } else if (!page.isOverviewPage || page.isOverviewPage(window.location.href)) {
        if (!page.overview) {
          reject('Is overview page but no overview found');
          return;
        }
        value.sync = false;
        value.title = page.overview.getTitle(window.location.href);
        value.identifier = page.overview.getIdentifier(window.location.href);
        if (typeof page.overview.uiSelector !== 'undefined') {
          page.overview.uiSelector(
            '<div><div id="MAL-SYNC-TEST">TEST-UI</div></div>'
          );
          value.uiSelector = j.$('#MAL-SYNC-TEST').text();
        }
      } else {
        reject('Not an overview or sync page');
      }

      if (
        typeof page.overview !== 'undefined' &&
        typeof page.overview.list !== 'undefined' &&
        typeof page.overview.list.elementUrl !== 'undefined'
      ) {
        const { elementEp, elementUrl } = page.overview.list;
        const elementArray = [] as string[];

        page.overview.list.elementsSelector().each(function(index, el) {
          try {
            const elEp = parseInt(`${elementEp(j.$(el))}`);
            elementArray[elEp] = elementUrl(j.$(el));
          } catch (e) {
            con.info(e);
          }
        });
        con.log(elementArray);
        if (elementArray.length) {
          value.epList = elementArray;
        }
      }
      console.log('result', value);
      resolve(value);
    }

    syncPage.reset = function() {};

    syncPage.cdn = function(type) {
      resolve({
        sync: 'cdn',
        type: type
      });
    };
    
    page.init(syncPage);
  });
};

function testForCloudflare() {
  if (
    document.title === 'Just a moment...' ||
    document.title.indexOf('Cloudflare') !== -1
  ) {
    return true;
  }
  return false;
}
