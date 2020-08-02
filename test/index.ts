import { pages as part1 } from '../src/pages/pages';
import { pages as part2 } from '../src/pages-adult/pages';

const pages = { ...part1, ...part2 };

// @ts-ignore
window.MalSyncTest = async function() {
  const value: any = {};

  const page = getPage(window.location.href);
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
        } else {
          value.sync = false;
          value.title = page.overview.getTitle(window.location.href);
          value.identifier = page.overview.getIdentifier(window.location.href);
          if (typeof page.overview.uiSelector !== 'undefined') {
            page.overview.uiSelector(
              '<div><div id="MAL-SYNC-TEST">TEST-UI</div></div>'
            );
            value.uiSelector = j.$('#MAL-SYNC-TEST').text();
          }
        }

        if (
          typeof page.overview !== 'undefined' &&
          typeof page.overview.list !== 'undefined'
        ) {
          const { elementEp } = page.overview.list;
          const { elementUrl } = page.overview.list;
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

function getPage(url) {
  for (const key in pages) {
    const page = pages[key];
    if (j.$.isArray(page.domain)) {
      var resPage;
      page.domain.forEach(singleDomain => {
        if (checkDomain(singleDomain)) {
          page.domain = singleDomain;
          resPage = page;
        }
      });
      if(resPage) return resPage;
    } else if (checkDomain(page.domain)) {
      return page;
    }

    function checkDomain(domain) {
      if (
        url.indexOf(
          `${
            utils
              .urlPart(domain, 2)
              .replace('.com.br', '.br')
              .split('.')
              .slice(-2, -1)[0]
          }.`,
        ) > -1
      ) {
        return true;
      }
      return false;
    }
  }
  return null;
}
