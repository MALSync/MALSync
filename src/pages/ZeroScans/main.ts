import { pageInterface } from '../pageInterface';

export const ZeroScans: pageInterface = getInter();

export function getInter(): pageInterface {
  let thisSelf;
  /* eslint-disable-next-line prefer-const */
  thisSelf = {
    name: 'ZeroScans',
    domain: 'https://zeroscans.com',
    languages: ['English'],
    type: 'manga',
    isSyncPage(url) {
      if (url.split('/')[3] === 'comics' && url.split('/')[5] >= '1') {
        return true;
      }
      return false;
    },
    sync: {
      getTitle(url) {
        return j
          .$('.d-flex .heading h6.text-highlight')
          .text()
          .trim();
      },
      getIdentifier(url) {
        return url.split('/')[4];
      },
      getOverviewUrl(url) {
        return j.$('div.container.py-5 div#pages-container div.d-flex div.btn-group a.btn').attr('href') || '';
      },
      getEpisode(url) {
        return Number(utils.urlPart(url, 6));
      },
      getVolume(url) {
        return Number(url.split('/')[5]);
      },
      nextEpUrl(url) {
        return j
          .$("div#content.flex div.container.py-5 div#pages-container div.d-flex a:contains('Next')")
          .attr('href');
      },
    },
    overview: {
      getTitle(url) {
        return j
          .$('.d-flex .heading h5.text-highlight')
          .text()
          .trim();
      },
      getIdentifier(url) {
        return utils.urlPart(url, 4);
      },
      uiSelector(selector) {
        j.$('div.col-lg-9.col-md-8.col-xs-12.text-muted div.row.py-2')
          .first()
          .before(
            j.html(
              `<div id= "MALSyncheading" class="heading"> <h6 class="text-highlight">MAL-Sync</h6></div><div id="malthing">${selector}</div>`,
            ),
          );
      },
      list: {
        offsetHandler: false,
        elementsSelector() {
          return j.$('div.list-item.col-sm-3');
        },
        elementUrl(selector) {
          return (
            selector
              .find('a')
              .first()
              .attr('href') || ''
          );
        },
        elementEp(selector) {
          return selector
            .find('a')
            .first()
            .attr('href')
            .split('/')[6];
        },
      },
    },
    init(page) {
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function() {
        if (
          page.url.split('/')[3] === 'comics' &&
          (page.url.split('/').length === 5 || page.url.split('/').length === 7)
        ) {
          page.handlePage();
        }
      });
    },
  };
  return thisSelf;
}
