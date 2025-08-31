import { pages as part1 } from '../src/pages/pages';
import { pages as part2 } from '../src/pages-adult/pages';
import { getPageConfig } from '../src/utils/test';
import { xhrAction } from '../src/background/messageHandler';
import { Chibi } from '../src/pages-chibi/ChibiProxy';
import { NotFoundError } from '../src/_provider/Errors';
import chibiList from '../src/pages-chibi/builder/chibiList';
import chibiPages from '../src/pages-chibi/builder/chibiPages';

const pages = { ...part1, ...part2 };

// @ts-ignore
window.chrome.runtime.sendMessage = (message: any, callback: (response: any) => void) => {
  if (message.name === 'xhr') {
    if (message.url.startsWith('https://chibi.malsync.moe/')) {
      let data: any = null;
      if (message.url.endsWith('/list.json')) {
        data = chibiList();
      } else {
        const chibiKey = message.url.split('/').pop().split('.json')[0];
        const chibiList = chibiPages();

        if (chibiKey && chibiList[chibiKey]) {
          data = chibiList[chibiKey];
        } else {
          throw new NotFoundError('Chibi not found');
        }
      }

      return callback({ responseText: JSON.stringify(data) });
    }
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
    page.init({
      url: window.location.href,
      reset() {
        //do nothing
      },
      handlePage() {
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
          if (typeof page.sync.getImage !== 'undefined') {
            value.image = page.sync.getImage();
          }
        } else if (!page.isOverviewPage || page.isOverviewPage(window.location.href)) {
          value.sync = false;
          value.title = page.overview.getTitle(window.location.href);
          value.identifier = page.overview.getIdentifier(window.location.href);
          if (typeof page.overview.uiSelector !== 'undefined') {
            page.overview.uiSelector(
              '<div><div id="MAL-SYNC-TEST">TEST-UI</div></div>'
            );
            value.uiSelector = j.$('#MAL-SYNC-TEST').text();
          }
          if (typeof page.overview.getImage !== 'undefined') {
            value.image = page.overview.getImage();
          }
        } else {
          reject('Not an overview or sync page');
          return;
        }

        if (
          typeof page.overview !== 'undefined' &&
          typeof page.overview.list !== 'undefined' &&
          typeof page.overview.list.elementUrl !== 'undefined'
        ) {
          const { elementEp, elementUrl } = page.overview.list;
          const elementArray = [] as JQuery<HTMLElement>[];

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
      },
      cdn(type) {
        resolve({
          sync: 'cdn',
          type: type
        });
      },
    });
  });
  return page.domain;

  return $('.link-mal-logo')
    .text()
    .trim();
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
